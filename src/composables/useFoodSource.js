import foodData from '@/data/food.js'

/**
 * v1: returns static curated food list.
 * v2: swap this composable to fetch from API — no UI changes needed.
 */
export async function useFoodSource() {
  // Simulate async so v2 swap is seamless
  return foodData
}
