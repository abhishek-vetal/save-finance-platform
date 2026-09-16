import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Repeat,
  Sparkles,
} from "lucide-react";

// stats data
export const statsData = [
  {
    value: "1",
    label: "Unified Finance Dashboard",
  },
  {
    value: "100%",
    label: "User-Controlled Data",
  },
  {
    value: "24/7",
    label: "Access to Your Finances",
  },
  {
    value: "AI",
    label: "Powered Financial Insights",
  },
];

// features data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "Financial Dashboard",
    description:
      "Get a clear overview of your accounts, balances, spending, and financial activity from a single dashboard.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "Transaction Tracking",
    description:
      "Create and manage income and expense transactions with categories, descriptions, dates, and account-level tracking.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "Budget Management",
    description:
      "Set a budget, track your spending, and monitor your expenses to stay aware of your financial limits.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "Multiple Accounts",
    description:
      "Manage multiple current and savings accounts and keep track of their balances in one place.",
  },
  {
    icon: <Repeat className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "Recurring Transactions",
    description:
      "Set up recurring income or expenses and manage their schedules without manually creating every transaction.",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "AI-Powered Insights",
    description:
      "Use AI-powered features to analyze financial information and get smarter insights into your spending and finances.",
  },
];

// how it works data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "1. Create Your Account",
    description:
      "Sign up securely with Clerk and create your personal SAVE profile.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "2. Add Your Financial Data",
    description:
      "Create your accounts, add income and expense transactions, and set your budget.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
    title: "3. Manage Your Finances",
    description:
      "Use your dashboard to monitor accounts, transactions, budgets, and spending patterns.",
  },
];

export const testimonialsData = [
  {
    name: "James Anderson",
    role: "Account Management",
    image: "/testimonial-1.png",
    quote:
      "SAVE gives me a simple way to manage multiple accounts and keep my financial information organized in one place.",
  },
  {
    name: "Emily Carter",
    role: "Software Developer",
    image: "/testimonial-2.png",
    quote:
      "Tracking income and expenses becomes much easier when everything is available from a single dashboard.",
  },
  {
    name: "Michael Johnson",
    role: "Budget Management",
    image: "/testimonial-3.png",
    quote:
      "Having my budget and spending information together makes it easier to understand where my money is going.",
  },
];