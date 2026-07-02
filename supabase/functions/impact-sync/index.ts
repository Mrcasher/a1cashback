import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "all";

    const IMPACT_ACCOUNT_SID = Deno.env.get("IMPACT_ACCOUNT_SID");
    const IMPACT_AUTH_TOKEN = Deno.env.get("IMPACT_AUTH_TOKEN");

    if (!IMPACT_ACCOUNT_SID || !IMPACT_AUTH_TOKEN) {
      return new Response(JSON.stringify({
        error: "Impact credentials not configured",
        message: "Please set IMPACT_ACCOUNT_SID and IMPACT_AUTH_TOKEN environment variables"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const syncResults = {
      stores: { processed: 0, added: 0, updated: 0 },
      deals: { processed: 0, added: 0, updated: 0 },
      transactions: { processed: 0, added: 0, updated: 0 },
      errors: [] as string[]
    };

    // Base headers for Impact API
    const impactHeaders = {
      "Authorization": `Basic ${btoa(`${IMPACT_ACCOUNT_SID}:${IMPACT_AUTH_TOKEN}`)}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    // Fetch merchants from Impact
    const fetchMerchants = async () => {
      try {
        const response = await fetch(
          `https://api.impact.com/Mediapartners/${IMPACT_ACCOUNT_SID}/Advertisers?PageSize=1000`,
          { headers: impactHeaders }
        );
        const data = await response.json();

        return data.Advertisers || [];
      } catch (error) {
        syncResults.errors.push(`Merchants fetch error: ${error.message}`);
        return [];
      }
    };

    // Fetch deals/coupons from Impact
    const fetchDeals = async () => {
      try {
        const response = await fetch(
          `https://api.impact.com/Mediapartners/${IMPACT_ACCOUNT_SID}/CampaignItems?ItemType=Coupon&PageSize=1000`,
          { headers: impactHeaders }
        );
        const data = await response.json();

        return data.CampaignItems || [];
      } catch (error) {
        syncResults.errors.push(`Deals fetch error: ${error.message}`);
        return [];
      }
    };

    // Fetch transactions from Impact
    const fetchTransactions = async () => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const formattedStartDate = startDate.toISOString().split('T')[0];

        const response = await fetch(
          `https://api.impact.com/Mediapartners/${IMPACT_ACCOUNT_SID}/Actions?StartDate=${formattedStartDate}&PageSize=1000`,
          { headers: impactHeaders }
        );
        const data = await response.json();

        return data.Actions || [];
      } catch (error) {
        syncResults.errors.push(`Transactions fetch error: ${error.message}`);
        return [];
      }
    };

    // Sync merchants to Supabase
    const syncMerchantsToSupabase = async (merchants: any[]) => {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseKey) {
        syncResults.errors.push("Supabase credentials not configured");
        return;
      }

      for (const merchant of merchants) {
        syncResults.stores.processed++;

        try {
          const storeData = {
            impact_merchant_id: merchant.AdvertiserId,
            name: merchant.AdvertiserName,
            slug: merchant.AdvertiserName.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
            website_url: merchant.AdvertiserUrl || '',
            description: merchant.Description || `Shop at ${merchant.AdvertiserName}`,
            cashback_rate: merchant.PublishedBudget?.DefaultBid || merchant.MaximumBid || 0,
            cashback_type: 'percent',
            is_active: merchant.Status === 'Active',
            last_synced_at: new Date().toISOString()
          };

          const response = await fetch(
            `${supabaseUrl}/rest/v1/stores?impact_merchant_id=eq.${merchant.AdvertiserId}`,
            {
              headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
              }
            }
          );

          const existing = await response.json();

          if (existing && existing.length > 0) {
            await fetch(
              `${supabaseUrl}/rest/v1/stores?impact_merchant_id=eq.${merchant.AdvertiserId}`,
              {
                method: "PATCH",
                headers: {
                  "apikey": supabaseKey,
                  "Authorization": `Bearer ${supabaseKey}`,
                  "Content-Type": "application/json",
                  "Prefer": "return=minimal"
                },
                body: JSON.stringify(storeData)
              }
            );
            syncResults.stores.updated++;
          } else {
            await fetch(`${supabaseUrl}/rest/v1/stores`, {
              method: "POST",
              headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
              },
              body: JSON.stringify(storeData)
            });
            syncResults.stores.added++;
          }
        } catch (error) {
          syncResults.errors.push(`Store sync error (${merchant.AdvertiserName}): ${error.message}`);
        }
      }
    };

    // Perform sync based on action
    if (action === "all" || action === "stores") {
      const merchants = await fetchMerchants();
      await syncMerchantsToSupabase(merchants);
    }

    if (action === "all" || action === "deals") {
      const deals = await fetchDeals();
      syncResults.deals.processed = deals.length;
    }

    if (action === "all" || action === "transactions") {
      const transactions = await fetchTransactions();
      syncResults.transactions.processed = transactions.length;
    }

    // Log sync to database
    const supabaseUrl = Deno.env.get("https://tdtxqpszfebrozjtrwdq.supabase.co/rest/v1/");
    const supabaseKey = Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHhxcHN6ZmVicm96anRyd2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDc3MzEsImV4cCI6MjA5Nzk4MzczMX0._qw7u_44zkZ6rNlQYRl7IkCr_3dr_KI4ANtdZenStT4");

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/sync_logs`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          sync_type: action,
          status: syncResults.errors.length > 0 ? "failed" : "completed",
          records_processed: syncResults.stores.processed + syncResults.deals.processed + syncResults.transactions.processed,
          records_added: syncResults.stores.added + syncResults.deals.added + syncResults.transactions.added,
          records_updated: syncResults.stores.updated,
          error_message: syncResults.errors.length > 0 ? syncResults.errors.join("; ") : null
        })
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Sync completed",
      results: syncResults,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
