/**
 * Riot Games API Proxy — Cloudflare Worker
 * 
 * This worker acts as a secure proxy between your frontend and the Riot API.
 * Your Riot API key is stored as a Cloudflare secret and never exposed to the browser.
 * 
 * === SETUP INSTRUCTIONS ===
 * 
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this code into the editor
 * 3. Go to Settings → Variables → Environment Variables
 * 4. Add: RIOT_API_KEY = "RGAPI-your-key-here" (encrypt it)
 * 5. Add: ALLOWED_ORIGIN = "https://yourdomain.com" (or "*" for dev)
 * 6. Deploy the worker
 * 7. Copy the worker URL (e.g. https://riot-proxy.yourname.workers.dev)
 * 8. Update PROXY_URL in your main.js with this URL
 * 
 * === ENDPOINTS ===
 * 
 * GET /rotation         → Free champion rotation
 * GET /challenger/:region  → Challenger leaderboard (region: na1, euw1, kr, etc.)
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Only allow GET
        if (request.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: corsHeaders,
            });
        }

        const apiKey = env.RIOT_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: corsHeaders,
            });
        }

        try {
            let riotUrl = '';

            // --- Free Champion Rotation ---
            if (path === '/rotation') {
                riotUrl = 'https://na1.api.riotgames.com/lol/platform/v3/champion-rotations';
            }

            // --- Challenger Leaderboard ---
            else if (path.startsWith('/challenger/')) {
                const region = path.split('/')[2];
                const validRegions = ['na1', 'euw1', 'eun1', 'kr', 'jp1', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
                
                if (!validRegions.includes(region)) {
                    return new Response(JSON.stringify({ error: 'Invalid region' }), {
                        status: 400,
                        headers: corsHeaders,
                    });
                }
                riotUrl = `https://${region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
            }

            // --- Unknown route ---
            else {
                return new Response(JSON.stringify({ error: 'Not found', routes: ['/rotation', '/challenger/:region'] }), {
                    status: 404,
                    headers: corsHeaders,
                });
            }

            // Fetch from Riot API
            const riotRes = await fetch(riotUrl, {
                headers: { 'X-Riot-Token': apiKey },
            });

            const data = await riotRes.json();

            if (!riotRes.ok) {
                return new Response(JSON.stringify({ error: 'Riot API error', status: riotRes.status, detail: data }), {
                    status: riotRes.status,
                    headers: corsHeaders,
                });
            }

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Cache-Control': 'public, max-age=300', // Cache 5 min
                },
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: 'Internal error', message: err.message }), {
                status: 500,
                headers: corsHeaders,
            });
        }
    },
};
