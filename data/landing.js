import {
  BarChart3,
  Receipt,
  PieChart,
  RefreshCw,
  Repeat,
  ScanText,
  Wallet,
  ShieldCheck,
  Clock,
  TrendingUp,
  UserPlus,
  Landmark,
  SlidersHorizontal,
} from "lucide-react";

// stats data
export const statsData = [
  {
    icon: <Wallet className="h-4.5 w-4.5" />,
    title: "One Place",
    description: "A unified view of your finances",
  },
  {
    icon: <ShieldCheck className="h-4.5 w-4.5" />,
    title: "Data Control",
    description: "Manage your financial information",
  },
  {
    icon: <Clock className="h-4.5 w-4.5" />,
    title: "Access Anytime",
    description: "Review your finances whenever you need",
  },
  {
    icon: <TrendingUp className="h-4.5 w-4.5" />,
    title: "AI-Assisted Insights",
    description: "Understand spending patterns and trends",
  },
];

// features data
export const featuresData = [
  {
    icon: <RefreshCw className="h-5 w-5" />,
    title: "Automatic Bank Sync",
    badge: "Powered by Plaid",
    description:
      "Connect a supported bank account through Plaid and automatically sync eligible transactions into SAVE, reducing the need for manual transaction entry.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Financial Dashboard",
    description:
      "Get a clear overview of your accounts, balances, spending, and financial activity from one dashboard.",
  },
  {
    icon: <PieChart className="h-5 w-5" />,
    title: "Budget Management",
    description:
      "Set budgets, track your spending, and monitor your expenses to stay aware of your financial limits.",
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "Transaction Tracking",
    description:
      "Create and manage income and expense transactions with categories, descriptions, dates, and account-level tracking.",
  },
  {
    icon: <Repeat className="h-5 w-5" />,
    title: "Recurring Transactions",
    description:
      "Set up recurring income or expenses and manage their schedules without manually creating every transaction.",
  },
  {
    icon: <ScanText className="h-5 w-5" />,
    title: "AI Receipt Scanning",
    description:
      "Scan receipts and extract relevant transaction details to make recording expenses easier.",
  },
];

// how it works data
export const howItWorksData = [
  {
    step: "01",
    icon: <UserPlus className="h-5 w-5" />,
    title: "Create Account",
    description:
      "Sign up securely and create your personal SAVE profile.",
  },
  {
    step: "02",
    icon: <Landmark className="h-5 w-5" />,
    title: "Connect or Add Account",
    description:
      "Connect a supported bank through Plaid to sync eligible transactions automatically, or add financial data manually.",
  },
  {
    step: "03",
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Manage Finances",
    description:
      "Review transactions, organize expenses, manage budgets, and understand your spending from one dashboard.",
  },
];