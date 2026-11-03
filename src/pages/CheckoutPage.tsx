
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Timer,
} from "lucide-react";

type Network = "MTN" | "Telecel" | "AT";

export default function CheckoutPage() {
  const [network, setNetwork] = useState<Network>("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  const handlePayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phoneNumber.trim()) {
      return;
    }

    // Connect your mobile money payment API here.
    console.log({
      network,
      phoneNumber,
    });
  };

  const handleCancel = () => {
    // Connect this to your ticket-release or navigation logic.
    console.log("Reservation cancelled");
  };

  return (
    <main className="min-h-screen bg-slate-100 sm:flex sm:items-center sm:justify-center sm:p-6">
      <section className="mx-auto flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-white shadow-xl sm:h-[844px] sm:rounded-xl">
        
        {/* Header */}
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <button
            type="button"
            className="flex items-center gap-3 text-slate-900"
            aria-label="Go back"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
            <span className="text-base font-bold">Checkout</span>
          </button>

          <span className="text-xs text-slate-500">
            Step 1 of 2
          </span>
        </header>

        {/* Reservation countdown */}
        <div className="flex shrink-0 items-center justify-between border-b-4 border-emerald-300 bg-lime-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Timer size={22} className="shrink-0 text-slate-900" />

            <div>
              <p className="text-xs font-bold text-slate-950">
                Tickets held for you
              </p>
              <p className="text-[11px] leading-tight text-slate-800">
                Complete payment before the timer ends
              </p>
            </div>
          </div>

          <span className="text-xl font-extrabold tabular-nums text-slate-950">
            {minutes}:{seconds}
          </span>
        </div>

        {/* Scrollable checkout content */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3">

          {/* Ticket summary */}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded bg-emerald-50 text-emerald-700">
                <span className="text-[9px] font-bold uppercase">Nov</span>
                <span className="text-base font-extrabold leading-none">
                  14
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-slate-950">
                  Campus Jazz Night
                </h2>
                <p className="text-[11px] text-slate-500">
                  Sat 7:00 PM · Great Hall, KNUST
                </p>
              </div>
            </div>

            <div className="space-y-3 py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Regular × 2
                </span>
                <span className="font-medium text-slate-900">
                  GHS 80.00
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Service fee
                </span>
                <span className="font-medium text-slate-900">
                  GHS 0.00
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-900">
                Total
              </span>
              <span className="text-xl font-extrabold text-slate-950">
                GHS 80.00
              </span>
            </div>
          </div>

          {/* Payment form */}
          <form
            id="checkout-form"
            onSubmit={handlePayment}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <h2 className="text-sm font-bold text-slate-950">
              Pay with mobile money
            </h2>

            {/* Network selection */}
            <div>
              <label className="mb-2 block text-[11px] font-medium text-slate-700">
                Network
              </label>

              <div className="space-y-1.5">
                {(["MTN", "Telecel", "AT"] as Network[]).map((item) => (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition ${
                      network === item
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="network"
                      value={item}
                      checked={network === item}
                      onChange={() => setNetwork(item)}
                      className="h-[18px] w-[18px] accent-emerald-600"
                    />

                    <span className="text-xs font-medium text-slate-900">
                      {item === "MTN"
                        ? "MTN Mobile Money"
                        : item === "Telecel"
                          ? "Telecel Cash"
                          : "AT Money"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Phone number */}
            <div>
              <label
                htmlFor="mobile-money-number"
                className="mb-1.5 block text-[11px] font-medium text-slate-700"
              >
                Mobile money number
              </label>

              <div className="flex h-10 items-center overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
                <span className="border-r border-slate-200 px-3 text-xs text-slate-800">
                  +233
                </span>

                <input
                  id="mobile-money-number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="24 412 3456"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value)
                  }
                  required
                  className="h-full min-w-0 flex-1 px-3 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <p className="mt-1.5 text-[10px] text-slate-500">
                You'll get a prompt on this phone to approve GHS 80.00.
              </p>
            </div>
          </form>
        </div>

        {/* Fixed bottom actions */}
        <footer className="shrink-0 border-t border-slate-200 bg-white px-3 pb-4 pt-2">
          <button
            type="submit"
            form="checkout-form"
            disabled={secondsLeft === 0}
            className="flex h-10 w-full items-center justify-center rounded-sm bg-emerald-700 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            PAY GHS 80.00
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="mt-3 w-full text-center text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Cancel and release tickets
          </button>
        </footer>
      </section>
    </main>
  );
}
