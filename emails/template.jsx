import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data = {},
}) {
  const safeData = {
    percentageUsed: data?.percentageUsed || 0,
    budgetAmount: data?.budgetAmount || 0,
    totalExpenses: data?.totalExpenses || 0,
    dashboardUrl: data?.dashboardUrl || "#",
  };

  const remainingAmount = safeData.budgetAmount - safeData.totalExpenses;

  const isOverBudget = remainingAmount < 0;

  if (type === "monthly-report") {
    const net = data?.stats?.totalIncome - data?.stats?.totalExpenses;

    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Summary</Preview>

        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* Header */}

            <Section style={styles.header}>
              <Text style={styles.logo}>Save</Text>

              <Text style={styles.subtitle}>Monthly Financial Report</Text>
            </Section>

            {/* Main Content */}

            <Section style={styles.content}>
              <Text style={styles.date}>{data?.month}</Text>

              <Heading style={styles.title}>Monthly Financial Summary</Heading>

              <Text style={styles.text}>Hello {userName},</Text>

              <Text style={styles.text}>
                Here is a summary of your financial activity for {data?.month}.
                Review your spending trends and insights below.
              </Text>

              {/* Summary Metrics */}

              <Section style={styles.reportCard}>
                <Row>
                  <Column>
                    <Text style={styles.metricLabel}>Total Income</Text>

                    <Text style={styles.incomeValue}>
                      ₹{data?.stats?.totalIncome?.toLocaleString()}
                    </Text>
                  </Column>

                  <Column>
                    <Text style={styles.metricLabel}>Total Expenses</Text>

                    <Text style={styles.expenseValue}>
                      ₹{data?.stats?.totalExpenses?.toLocaleString()}
                    </Text>
                  </Column>
                </Row>

                <Hr style={styles.hr} />

                <Row>
                  <Column>
                    <Text style={styles.metricLabel}>Net Balance</Text>

                    <Text
                      style={net >= 0 ? styles.incomeValue : styles.dangerValue}
                    >
                      ₹{net?.toLocaleString()}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Category Breakdown */}

              {data?.stats?.byCategory && (
                <Section style={styles.reportCard}>
                  <Heading style={styles.sectionHeading}>
                    Expense Breakdown
                  </Heading>

                  {Object.entries(data.stats.byCategory).map(
                    ([category, amount]) => (
                      <Row key={category} style={styles.categoryRow}>
                        <Column>
                          <Text style={styles.categoryName}>{category}</Text>
                        </Column>

                        <Column align="right">
                          <Text style={styles.categoryAmount}>
                            ₹{Number(amount).toLocaleString()}
                          </Text>
                        </Column>
                      </Row>
                    ),
                  )}
                </Section>
              )}

              {/* AI Insights */}

              {data?.insights?.length > 0 && (
                <Section style={styles.reportCard}>
                  <Heading style={styles.sectionHeading}>Save Insights</Heading>

                  {data.insights.map((insight, index) => (
                    <Text key={index} style={styles.insight}>
                      • {insight}
                    </Text>
                  ))}
                </Section>
              )}

              <Section style={styles.buttonContainer}>
                <a href={data?.dashboardUrl} style={styles.button}>
                  Open Dashboard
                </a>
              </Section>
            </Section>

            <Section style={styles.footer}>
              <Text style={styles.footerText}>Thank you for using Save.</Text>

              <Text style={styles.footerText}>
                © {new Date().getFullYear()} Save
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  // if type is budget-alert
  return (
    <Html>
      <Head />

      <Preview>Budget utilization update for your account</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>Save</Text>

            <Text style={styles.subtitle}>
              Personal Financial Management Platform
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>

            <Heading style={styles.title}>Budget Utilization Alert</Heading>

            <Text style={styles.text}>Hello {userName},</Text>

            <Text style={styles.text}>
              This is an automated update regarding your monthly budget
              activity. Your current budget utilization has reached{" "}
              <strong>{safeData.percentageUsed.toFixed(1)}%</strong>.
            </Text>

            {/* Financial Summary Card */}

            <Section style={styles.metricCard}>
              <Row>
                <Column>
                  <Text style={styles.metricLabel}>Allocated Budget</Text>

                  <Text style={styles.metricValue}>
                    ₹
                    {safeData.budgetAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Column>

                <Column>
                  <Text style={styles.metricLabel}>Current Expenses</Text>

                  <Text style={styles.metricValue}>
                    ₹
                    {safeData.totalExpenses.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Column>
              </Row>

              <Hr style={styles.hr} />

              <Row>
                <Column>
                  <Text style={styles.metricLabel}>Remaining Balance</Text>

                  <Text
                    style={
                      isOverBudget ? styles.dangerValue : styles.metricValue
                    }
                  >
                    ₹
                    {Math.abs(remainingAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    {isOverBudget && " deficit"}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={styles.text}>
              We recommend reviewing your recent transaction activity and
              evaluating spending trends to maintain alignment with your
              financial goals.
            </Text>

            {/* CTA */}

            <Section style={styles.buttonContainer}>
              <a href={safeData.dashboardUrl} style={styles.button}>
                View Dashboard
              </a>
            </Section>
          </Section>

          {/* Footer */}

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is an automated account notification from Save.
            </Text>

            <Text style={styles.footerText}>
              Please do not reply to this email.
            </Text>

            <Hr style={styles.footerHr} />

            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Save. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f8fafc",
    padding: "40px 0",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
  },

  container: {
    maxWidth: "620px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },

  header: {
    padding: "32px",
    borderBottom: "1px solid #e2e8f0",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0",
    letterSpacing: "1px",
  },

  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "6px",
  },

  content: {
    padding: "40px",
  },

  date: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "12px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "24px",
  },

  text: {
    fontSize: "15px",
    lineHeight: "26px",
    color: "#475569",
    marginBottom: "18px",
  },

  metricCard: {
    backgroundColor: "#fafafa",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "24px",
    margin: "30px 0",
  },

  metricLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "6px",
  },

  metricValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0",
  },

  hr: {
    borderTop: "1px solid #e2e8f0",
    margin: "20px 0",
  },

  buttonContainer: {
    marginTop: "32px",
  },

  button: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },

  footer: {
    padding: "24px 32px",
    backgroundColor: "#fafafa",
    borderTop: "1px solid #e2e8f0",
  },

  footerHr: {
    borderTop: "1px solid #e2e8f0",
    margin: "16px 0",
  },

  footerText: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "4px 0",
  },

  reportCard: {
    backgroundColor: "#fafafa",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "24px",
  },

  sectionHeading: {
    fontSize: "18px",
    color: "#0f172a",
    marginBottom: "16px",
  },

  incomeValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0",
  },

  expenseValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0",
  },

  dangerValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0",
  },

  categoryRow: {
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  categoryName: {
    fontSize: "14px",
    color: "#475569",
  },

  categoryAmount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },

  insight: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "24px",
    marginBottom: "10px",
  },
};
