import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { CartesianChart, Line, Pie, PolarChart } from "victory-native";

/**
 * Static mock data for now.
 * Later you can replace this with data
 * fetched from Supabase and transformed into
 * [{ label: 'Category', value: totalNumber, color: '#color' }] objects.
 */
const mockSpending = [
  { label: "Food", value: 450, color: "#FF6B6B" },
  { label: "Rent", value: 1200, color: "#4ECDC4" },
  { label: "Shopping", value: 300, color: "#45B7D1" },
];

// have mock total networth here and time series data here.
const mockTotalNetworth = 687041.79;
const mockTotalNetworthTimeSeries = [
  { day: 0, networth: 663000 },
  { day: 2, networth: 666000 },
  { day: 4, networth: 668000 },
  { day: 6, networth: 669500 },
  { day: 8, networth: 671000 },
  { day: 10, networth: 670000 },
  { day: 12, networth: 673000 },
  { day: 14, networth: 675000 },
  { day: 16, networth: 677000 },
  { day: 18, networth: 679000 },
  { day: 20, networth: 680000 },
  { day: 22, networth: 681500 },
  { day: 24, networth: 682000 },
  { day: 26, networth: 684000 },
  { day: 28, networth: 686000 },
  { day: 30, networth: 687041.79 },
];

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const chartSize = Math.min(width * 0.8, 300); // keeps the pie responsive

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
      
      {/* Net Worth Section */}
      <View style={{ 
        alignItems: "center", 
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 12,
        padding: 20,
        backgroundColor: "#FAFAFA"
      }}>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>
          NET WORTH
        </Text>
        <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 5 }}>
          {formatCurrency(mockTotalNetworth)}
        </Text>
        <Text style={{ fontSize: 14, color: "#22C55E" }}>
          ↗ $23,542.96 (3.5%) 1 month change
        </Text>
      </View>

      {/* Net Worth Chart */}
      <View style={{ 
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 12,
        padding: 20,
        backgroundColor: "#FAFAFA"
      }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" }}>
          Net Worth Performance
        </Text>
        <View style={{ height: 200, width: width - 80 }}>
          <CartesianChart
            data={mockTotalNetworthTimeSeries}
            xKey="day"
            yKeys={["networth"]}
          >
            {({ points }) => (
              <Line points={points.networth} color="#4ECDC4" strokeWidth={3} />
            )}
          </CartesianChart>
        </View>
      </View>

      {/* Spending Breakdown Section */}
      <View style={{ 
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 12,
        padding: 20,
        backgroundColor: "#FAFAFA"
      }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Spending Breakdown
        </Text>
        
        <View style={{ height: chartSize, width: chartSize }}>
          <PolarChart
            data={mockSpending}
            labelKey={"label"}
            valueKey={"value"}
            colorKey={"color"}
          >
            <Pie.Chart innerRadius={80}>
              {({ slice }) => (
                <Pie.Slice key={`${slice.label}-${slice.value}`}>
                  <Pie.Label color="white" />
                </Pie.Slice>
              )}
            </Pie.Chart>
          </PolarChart>
        </View>

        {/* Legend */}
        <View style={{ marginTop: 20 }}>
          {mockSpending.map((item) => (
            <View key={item.label} style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
              <View 
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: item.color,
                  marginRight: 10,
                  borderRadius: 10
                }}
              />
              <Text style={{ fontSize: 16 }}>
                {item.label}: ${item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}