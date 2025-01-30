"use client"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Payment {
  id: string
  orderId: string
  customerName: string
  amount: number
  type: string
  date: Date
}

interface FinancialData {
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  averageTransaction: number
}

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [financialData, setFinancialData] = useState<FinancialData>({
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageTransaction: 0,
  })
  const [filter, setFilter] = useState("")
  const [dateRange, setDateRange] = useState("daily")

  useEffect(() => {
    fetchPayments()
    fetchFinancialData()
  }, [])

  const fetchPayments = async () => {
    const q = query(
      collection(db, "payments"),
      where("date", ">=", Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
    )
    const querySnapshot = await getDocs(q)
    const paymentsData: Payment[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      paymentsData.push({
        id: doc.id,
        orderId: data.orderId,
        customerName: data.customerName,
        amount: data.amount,
        type: data.type,
        date: data.date.toDate(),
      })
    })
    setPayments(paymentsData)
  }

  const fetchFinancialData = async () => {
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const dailyQuery = query(collection(db, "payments"), where("date", ">=", Timestamp.fromDate(dayStart)))
    const weeklyQuery = query(collection(db, "payments"), where("date", ">=", Timestamp.fromDate(weekStart)))
    const monthlyQuery = query(collection(db, "payments"), where("date", ">=", Timestamp.fromDate(monthStart)))

    const [dailySnapshot, weeklySnapshot, monthlySnapshot] = await Promise.all([
      getDocs(dailyQuery),
      getDocs(weeklyQuery),
      getDocs(monthlyQuery),
    ])

    const dailyRevenue = dailySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
    const weeklyRevenue = weeklySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
    const monthlyRevenue = monthlySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)
    const averageTransaction = monthlyRevenue / monthlySnapshot.size || 0

    setFinancialData({
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      averageTransaction,
    })
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.customerName.toLowerCase().includes(filter.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(filter.toLowerCase()),
  )

  const getChartData = () => {
    const data: { [key: string]: { name: string; revenue: number } } = {}

    payments.forEach((payment) => {
      let key
      const date = payment.date

      switch (dateRange) {
        case "daily":
          key = date.toLocaleDateString()
          break
        case "weekly":
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
          key = weekStart.toLocaleDateString()
          break
        case "monthly":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`
          break
      }

      if (!data[key]) {
        data[key] = { name: key, revenue: 0 }
      }
      data[key].revenue += payment.amount
    })

    return Object.values(data)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financial Management</h1>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financialData.dailyRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financialData.weeklyRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financialData.monthlyRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Avg. Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financialData.averageTransaction.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search by customer or order ID"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.orderId}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.type}</TableCell>
                  <TableCell>{payment.date.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

