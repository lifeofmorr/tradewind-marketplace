import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { vin } = await req.json();
    if (!vin || vin.length !== 17) {
      return new Response(
        JSON.stringify({ error: "Invalid VIN — must be 17 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // NHTSA vPIC API — free, no credentials needed
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${encodeURIComponent(vin)}?format=json`;
    const res = await fetch(url);
    const data = await res.json();

    const results = data.Results ?? [];
    const get = (id: number) => results.find((r: any) => r.VariableId === id)?.Value || null;

    const decoded = {
      vin,
      make: get(26),
      model: get(28),
      year: get(29),
      trim: get(38),
      body_class: get(5),
      drive_type: get(15),
      fuel_type: get(24),
      engine_cylinders: get(9),
      engine_displacement_l: get(11),
      engine_hp: get(71),
      transmission: get(37),
      plant_city: get(31),
      plant_country: get(33),
      plant_state: get(32),
      manufacturer: get(27),
      vehicle_type: get(39),
      gvwr: get(25),
      error_code: get(143),
      error_text: get(156),
      raw_count: results.length,
    };

    return new Response(JSON.stringify(decoded), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
