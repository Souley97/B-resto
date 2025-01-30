"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  customersServed: number
  lowStockItems: number
}

interface ChartData {
  name: string
  orders: number
  revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    customersServed: 0,
    lowStockItems: 0,
  })
  const playSuccessSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => {
      console.error('Erreur lors de la lecture du fichier audio:', error);
    });
  };
  const [chartData, setChartData] = useState<ChartData[]>([])


  useEffect(() => {
    const fetchDashboardData = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = Timestamp.fromDate(today)

      // Fetch today's orders
      const ordersQuery = query(collection(db, "orders"), where("createdAt", ">=", todayTimestamp))
      const ordersSnapshot = await getDocs(ordersQuery)

      let totalOrders = 0
      let totalRevenue = 0
      const customersServed = new Set()

      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data()
        totalOrders++
        totalRevenue += orderData.total
        customersServed.add(orderData.customerId)
      })

      // Fetch low stock items
      const inventoryQuery = query(
        collection(db, "inventory"),
        where("quantity", "<=", 10), // Assuming 10 is the threshold for low stock
      )
      const inventorySnapshot = await getDocs(inventoryQuery)
      const lowStockItems = inventorySnapshot.size

      setStats({
        totalOrders,
        totalRevenue,
        customersServed: customersServed.size,
        lowStockItems,
      })

      // Fetch data for the chart (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo)

      const chartQuery = query(collection(db, "orders"), where("createdAt", ">=", sevenDaysAgoTimestamp))
      const chartSnapshot = await getDocs(chartQuery)

      const chartDataMap = new Map<string, ChartData>()

      chartSnapshot.forEach((doc) => {
        const orderData = doc.data()
        const date = orderData.createdAt.toDate().toLocaleDateString()

        if (!chartDataMap.has(date)) {
          chartDataMap.set(date, { name: date, orders: 0, revenue: 0 })
        }

        const dayData = chartDataMap.get(date)!
        dayData.orders++
        dayData.revenue += orderData.total
      })

      setChartData(Array.from(chartDataMap.values()))
    }

    fetchDashboardData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="flex justify-between my-10">
        <Card className="lg:w-2/3 rounded-3xl p-6 bg-gradient-to-r flex mr-6 from-indigo-400 via-pink-500 to-purple-500 text-white"  >
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-4xl font-bold">bonjour Julinho 👋
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Profile en cours de complétion, continuez.</div>
            </CardContent>
          </div>
          <div>
            {/* image  */}
            <img src="res.png" alt="Profile picture" className="object-cover w-full h-40 rounded-lg" />
          </div>

        </Card>
        <Card className="rounded-3xl w-1/3 md:hidden  justify-between bg-gradient-to-r   bg-white/50 backdrop-blur-xl  border-white border-2 shadow-xl transition-all duration-300"  >
        <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent  className="flex flex-row items-center justify-center space-y-0 pb-2">
            <div className="text-2xl font-bold">FCFA{stats.totalRevenue} FCFA</div>
          </CardContent>
        </Card>

      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="rounded-3xl justify-between bg-gradient-to-r flex mr-6 bg-white/50 backdrop-blur-xl  border-white border-2 shadow-xl transition-all duration-300"  >
      <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
           
          </div>
          <div>
            {/* image  */}
            <img src="res.png" alt="Profile picture" className="object-cover w-full  h-20 rounded-lg" />
          </div>

        </Card>
        <Card className="rounded-3xl justify-between bg-gradient-to-r flex mr-6 bg-white/50 backdrop-blur-xl  border-white border-2 shadow-xl transition-all duration-300"  >
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}  <span className="text-lg">FCFA</span></div>
            </CardContent>
           
          </div>
          <div>
            {/* image  */}
            <img src="res.png" alt="Profile picture" className="object-cover w-full  h-20 rounded-lg" />
          </div>

        </Card>
        <Card className="rounded-3xl justify-between bg-gradient-to-r flex mr-6 bg-white/50 backdrop-blur-xl  border-white border-2 shadow-xl transition-all duration-300"  >
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers Served</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
           
          </div>
          <div>
            {/* image  */}
            <img src="res.png" alt="Profile picture" className="object-cover w-full  h-20 rounded-lg" />
          </div>

        </Card>
       
      </div>

      {/* Chart */}
      <Card className="mb-8  bg-white/50 backdrop-blur-xl  rounded-2xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue (FCFA)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      {/* We'll implement this in the next step */}
    </div>
  )
}

