import { useState } from 'react'

export default function PaymentForm() {
  // const [discountExpanded, setDiscountExpanded] = useState(false)

  return (
    <section id="paymentForm" className="px-4 py-0">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-8 mt-12">
        <p className="text-gray-600 mb-4 text-sm">
          Access to this purchase will be sent to this email
        </p>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-gray-700 focus:outline-none focus:border-black"
        />

        <div className="flex gap-2 mb-4">
          <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:border-black">
            <option>+91</option>
          </select>

          <input
            type="text"
            placeholder="Add your phone number *"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:border-black"
          />
        </div>

        <input
          type="text"
          placeholder="Name *"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-3 text-gray-700 focus:outline-none focus:border-black"
        />

        {/* Discount Code - Hidden for now */}
        {/* {!discountExpanded ? (
          <div
            onClick={() => setDiscountExpanded(true)}
            className="border border-gray-300 rounded-xl p-3 flex items-center justify-between cursor-pointer mb-4"
          >
            <div className="flex items-center gap-2">
              <span>🏷️</span>
              <span className="text-gray-700 font-medium">Have a Discount Code?</span>
            </div>
            <span className="text-indigo-600 font-medium">Add</span>
          </div>
        ) : (
          <div className="border border-indigo-500 rounded-xl p-3 flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Enter your discount code"
              className="w-full outline-none text-gray-800"
            />
            <button className="ml-3 text-indigo-600 font-semibold">Apply</button>
          </div>
        )} */}

        {/* Pricing */}
        <div className="flex justify-between text-gray-700 mb-2 text-sm">
          <span>Sub Total</span>
          <span>
            ₹1,999
            <span className="line-through text-gray-400 ml-2">₹3,000</span>
          </span>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
          <span>Total</span>
          <span>₹1,999</span>
        </div>

        {/* Payment Button */}
        <button className="w-full bg-black text-white rounded-lg py-3 text-base font-semibold flex items-center justify-center gap-2">
          Join Virtual Library
          <span className="text-xl">→</span>
        </button>

        {/* Terms */}
        <p className="text-gray-600 text-sm mt-4 leading-relaxed">
          By continuing, you agree to our{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#a78bfa]"
          >
            Privacy policy
          </a>
          ,{' '}
          <a
            href="/refund-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#a78bfa]"
          >
            Refund policy
          </a>
          , and{' '}
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#a78bfa]"
          >
            Terms & Conditions
          </a>
          .
        </p>
      </div>
    </section>
  )
}

