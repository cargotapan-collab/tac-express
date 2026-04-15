import {
  RiBox3Line,
  RiBarcodeBoxLine,
  RiQrCodeLine,
  RiPhoneLine,
  RiMapPinLine,
  RiBuilding4Line,
  RiTruckLine,
  RiPlaneLine,
  RiFileList3Line,
  RiDashboardLine,
  RiUserLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiLogoutBoxRLine,
  RiLoginBoxLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiRobot2Line,
  RiExchangeFundsLine,
  RiMoonClearLine,
  RiSunLine,
  RiMenuLine,
  RiGithubFill,
} from "@remixicon/react"

// Create a mapping of keys to Remix Icons, enforcing standard naming
export const LogisticsIcons = {
  package: RiBox3Line,
  barcode: RiBarcodeBoxLine,
  qr: RiQrCodeLine,
  phone: RiPhoneLine,
  location: RiMapPinLine,
  hub: RiBuilding4Line,
  truck: RiTruckLine,
  plane: RiPlaneLine,
  invoice: RiFileList3Line,
  dashboard: RiDashboardLine,
  user: RiUserLine,
  check: RiCheckboxCircleLine,
  warning: RiErrorWarningLine,
  error: RiCloseCircleLine,
  arrowRight: RiArrowRightLine,
  arrowLeft: RiArrowLeftLine,
  logout: RiLogoutBoxRLine,
  login: RiLoginBoxLine,
  shield: RiShieldCheckLine,
  team: RiTeamLine,
  robot: RiRobot2Line,
  exchange: RiExchangeFundsLine,
  moon: RiMoonClearLine,
  sun: RiSunLine,
  menu: RiMenuLine,
  github: RiGithubFill,
}

export type IconName = keyof typeof LogisticsIcons

interface IconProps extends React.ComponentProps<typeof RiBox3Line> {
  name: IconName
}

export function Icon({ name, className, ...props }: IconProps) {
  const IconComponent = LogisticsIcons[name]

  if (!IconComponent) {
    console.warn(`Icon '${name}' not found in LogisticsIcons mapping.`)
    return null
  }

  return <IconComponent className={className} {...props} />
}
