// Component tests for the seller listing-creation flow: validation, the AI
// assistant, and the submit payload sent to (a mocked) Supabase.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const state = vi.hoisted(() => ({
  inserts: [] as { table: string; payload: Record<string, unknown> }[],
  listingInsertResult: { data: { id: "new-listing-1" } as { id: string } | null, error: null as { message: string } | null },
  videoInsertResult: { error: null as { message: string } | null },
  profile: { dealer_id: null as string | null },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "seller-7", email: "seller@example.com" },
    profile: state.profile,
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => ({
      insert: (payload: Record<string, unknown>) => {
        state.inserts.push({ table, payload });
        if (table === "listings") {
          return {
            select: () => ({
              maybeSingle: () => Promise.resolve(state.listingInsertResult),
            }),
          };
        }
        return Promise.resolve(state.videoInsertResult);
      },
    }),
  },
  publicStorageUrl: () => null,
}));

const aiListingGenerator = vi.hoisted(() => vi.fn());
vi.mock("@/lib/ai", () => ({ aiListingGenerator }));

import CreateListing from "@/pages/dashboard/seller/CreateListing";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/seller/listings/new"]}>
      <Routes>
        <Route path="/seller/listings/new" element={<CreateListing />} />
        <Route path="/seller/listings/:id" element={<div data-testid="listing-detail">created</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  state.inserts.length = 0;
  state.listingInsertResult = { data: { id: "new-listing-1" }, error: null };
  state.videoInsertResult = { error: null };
  state.profile = { dealer_id: null };
  aiListingGenerator.mockReset();
});

describe("CreateListing — validation", () => {
  it("blocks submission with an empty title and price", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));
    expect(await screen.findByText("Give it a real title")).toBeInTheDocument();
    expect(screen.getByText("Set a price")).toBeInTheDocument();
    expect(state.inserts).toHaveLength(0);
  });

  it("rejects a malformed video URL", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "2022 Whaler 320" } });
    fireEvent.change(screen.getByLabelText(/Asking price/), { target: { value: "250000" } });
    fireEvent.change(screen.getByLabelText(/Video walkaround URL/), { target: { value: "not a url" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));
    expect(await screen.findByText("Use a YouTube/Vimeo URL")).toBeInTheDocument();
    expect(state.inserts).toHaveLength(0);
  });

  it("rejects an out-of-range year", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "2022 Whaler 320" } });
    fireEvent.change(screen.getByLabelText(/Asking price/), { target: { value: "250000" } });
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "1850" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));
    await waitFor(() => expect(state.inserts).toHaveLength(0));
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
  });
});

describe("CreateListing — submit", () => {
  it("inserts a draft listing with the right payload and navigates to it", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "2022 Boston Whaler 320 Outrage" } });
    fireEvent.change(screen.getByLabelText("Make"), { target: { value: "Boston Whaler" } });
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "320 Outrage" } });
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2022" } });
    fireEvent.change(screen.getByLabelText(/Asking price/), { target: { value: "319500" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Naples" } });
    fireEvent.change(screen.getByLabelText("State"), { target: { value: "fl" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));

    expect(await screen.findByTestId("listing-detail")).toBeInTheDocument();

    expect(state.inserts).toHaveLength(1);
    const { table, payload } = state.inserts[0];
    expect(table).toBe("listings");
    expect(payload).toMatchObject({
      category: "boat",
      title: "2022 Boston Whaler 320 Outrage",
      make: "Boston Whaler",
      model: "320 Outrage",
      year: 2022,
      price_cents: 31_950_000, // dollars → cents
      currency: "USD",
      city: "Naples",
      state: "FL", // uppercased
      seller_id: "seller-7", // from auth, not the form
      seller_type: "private",
      dealer_id: null,
      status: "draft", // never published directly
    });
    expect(String(payload.slug)).toMatch(/^2022-boston-whaler-320-outrage-[a-z0-9]{6}$/);
  });

  it("marks dealer-owned listings as dealer inventory", async () => {
    state.profile = { dealer_id: "dealer-42" };
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "2021 Contender 35ST" } });
    fireEvent.change(screen.getByLabelText(/Asking price/), { target: { value: "100000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));
    await screen.findByTestId("listing-detail");
    expect(state.inserts[0].payload).toMatchObject({ seller_type: "dealer", dealer_id: "dealer-42" });
  });

  it("stores the video walkaround URL after creating the listing", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "2022 Whaler 320" } });
    fireEvent.change(screen.getByLabelText(/Asking price/), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText(/Video walkaround URL/), {
      target: { value: "https://youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));
    await screen.findByTestId("listing-detail");
    const video = state.inserts.find((i) => i.table === "listing_videos");
    expect(video?.payload).toEqual({
      listing_id: "new-listing-1",
      url: "https://youtube.com/watch?v=abc123",
    });
  });

  it("surfaces an insert failure without navigating", async () => {
    state.listingInsertResult = { data: null, error: { message: "row-level security violation" } };
    renderPage();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "2022 Whaler 320" } });
    fireEvent.change(screen.getByLabelText(/Asking price/), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("row-level security violation");
    expect(screen.queryByTestId("listing-detail")).not.toBeInTheDocument();
  });
});

describe("CreateListing — AI assistant", () => {
  it("requires a prompt before generating", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Generate with AI/ }));
    expect(await screen.findByText("Describe your vehicle in a sentence or two first.")).toBeInTheDocument();
    expect(aiListingGenerator).not.toHaveBeenCalled();
  });

  it("populates the form from the AI draft", async () => {
    aiListingGenerator.mockResolvedValue({
      draft: {
        title: "2022 Boston Whaler 320 Outrage — Twin 300s",
        description: "Garage-kept, recent service.",
        ai_summary: "Low-hour offshore-ready 320.",
        make: "Boston Whaler",
        model: "320 Outrage",
        year: 2022,
        city: "Naples",
        state: "FL",
        suggested_price_cents: 31_950_000,
      },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText("AI prompt"), {
      target: { value: "2022 Whaler 320 Outrage, twin 300s, Naples FL" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Generate with AI/ }));

    expect(await screen.findByText(/Draft populated/)).toBeInTheDocument();
    expect(aiListingGenerator).toHaveBeenCalledWith(
      "2022 Whaler 320 Outrage, twin 300s, Naples FL",
      "boat",
    );
    expect(screen.getByLabelText(/Title/)).toHaveValue("2022 Boston Whaler 320 Outrage — Twin 300s");
    expect(screen.getByLabelText("Make")).toHaveValue("Boston Whaler");
    expect(screen.getByLabelText("Year")).toHaveValue(2022);
    expect(screen.getByLabelText(/Asking price/)).toHaveValue(319_500); // cents → dollars
    expect(screen.getByLabelText("State")).toHaveValue("FL");
  });

  it("shows the AI error with a retry control on failure", async () => {
    aiListingGenerator.mockRejectedValueOnce(new Error("Rate limit exceeded"));
    aiListingGenerator.mockResolvedValueOnce({ draft: { title: "Recovered Title 320" } });
    renderPage();
    fireEvent.change(screen.getByLabelText("AI prompt"), { target: { value: "a boat" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate with AI/ }));
    expect(await screen.findByText(/Rate limit exceeded/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(/Draft populated/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toHaveValue("Recovered Title 320");
  });
});
