"use client"
import { useState, useEffect } from "react"
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Order {
  id: string
  items: { name: string; category: string; quantity: number; price: number }[]
  total: number
  createdAt: Date
}

interface CategorySales {
  category: string
  sales: number
}

interface DishSales {
  dish: string
  sales: number
}

interface HourlySales {
  hour: number
  sales: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day")
  const [categorySales, setCategorySales] = useState<CategorySales[]>([])
  const [dishSales, setDishSales] = useState<DishSales[]>([])
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([])

  useEffect(() => {
    fetchOrders()
  }, []) // Removed unnecessary dependency: timeRange

  const fetchOrders = async () => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
    }

    const q = query(collection(db, "orders"), where("createdAt", ">=", Timestamp.fromDate(startDate)))

    const querySnapshot = await getDocs(q)
    const ordersData: Order[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      ordersData.push({
        id: doc.id,
        items: data.items,
        total: data.total,
        createdAt: data.createdAt.toDate(),
      })
    })
    setOrders(ordersData)
    processData(ordersData)
  }

  const processData = (orders: Order[]) => {
    const categoryData: { [key: string]: number } = {}
    const dishData: { [key: string]: number } = {}
    const hourlyData: { [key: number]: number } = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        // Category sales
        categoryData[item.category] = (categoryData[item.category] || 0) + item.price * item.quantity

        // Dish sales
        dishData[item.name] = (dishData[item.name] || 0) + item.quantity

        // Hourly sales
        const hour = order.createdAt.getHours()
        hourlyData[hour] = (hourlyData[hour] || 0) + item.price * item.quantity
      })
    })

    setCategorySales(Object.entries(categoryData).map(([category, sales]) => ({ category, sales })))
    setDishSales(Object.entries(dishData).map(([dish, sales]) => ({ dish, sales })))
    setHourlySales(Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: hourlyData[i] || 0 })))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="flex justify-end ">
        <Select value={timeRange} onValueChange={(value: "day" | "week" | "month") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px] rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales by Category */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categorySales} dataKey="sales" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Selling Dishes */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl   border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Top Selling Dishes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dishSales.sort((a, b) => b.sales - a.sales).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dish" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Sales */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Hourly Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

