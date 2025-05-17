"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PriceSummaryProps {
  price: string
  discountCode: string
  onDiscountCodeChange: (code: string) => void
  onPurchase: () => void
  cashback?: string
}

export default function PriceSummary({
  price,
  discountCode,
  onDiscountCodeChange,
  onPurchase,
  cashback,
}: PriceSummaryProps) {
  return (
    <div>
      {/* Discount Code */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Discount code</label>
        <Input
          value={discountCode}
          onChange={(e) => onDiscountCodeChange(e.target.value)}
          className="bg-[#2a0044] border-purple-900"
        />
      </div>

      {/* Total Price */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black text-xs">€</span>
          </div>
          <h3 className="font-bold">Total price</h3>
        </div>
        <div className="text-3xl font-bold">{price}</div>
      </div>

      {/* Purchase Button */}
      <Button onClick={onPurchase} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3">
        Purchase Boosting
      </Button>

      {/* Cashback */}
      {cashback && (
        <div className="flex items-center gap-2 mt-4 text-sm">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black text-xs">€</span>
          </div>
          <span>{cashback} cashback for this purchase</span>
        </div>
      )}
    </div>
  )
}
