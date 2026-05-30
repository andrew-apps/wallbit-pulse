import nextVitals from "eslint-config-next/core-web-vitals"

const config = [
  {
    ignores: ["components/ui/**", "hooks/use-mobile.ts"],
  },
  ...nextVitals,
]

export default config
