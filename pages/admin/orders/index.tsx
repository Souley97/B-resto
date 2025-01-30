import { useState, useEffect } from "react"
import { collection, query, orderBy, limit, startAfter, onSnapshot, updateDoc, doc, getDocs, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorBoundary } from "react-error-boundary"
import { Card } from "@/components/ui/card"
import OrdersToday from "@/components/command-today"
import { getMessaging, onMessage } from "firebase/messaging";

interface Order {
  id: string
  customerName: string
  items: { name: string; quantity: number }[]
  total: number
  paymentMethod: string
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  createdAt: Date
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "total">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [pageSize, setPageSize] = useState(5) // Taille de la page (10, 20, 50)
  const [currentPage, setCurrentPage] = useState(1) // Page actuelle
  const [lastVisible, setLastVisible] = useState<any>(null) // Dernier élément visible pour la pagination
  const [totalOrders, setTotalOrders] = useState(0) // Total des commandes
  const [filterDate, setFilterDate] = useState("");
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);

  // Charger les commandes selon la pagination
 const playSuccessSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => {
      console.error('Erreur lors de la lecture du fichier audio:', error);
    });
  };


  useEffect(() => {
    const messaging = getMessaging();
  
    const loadOrders = async () => {
      const queryConstraints: any[] = [
        orderBy("createdAt", "desc"),
        limit(pageSize)
      ];
  
      if (currentPage > 1 && lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
  
      if (filterDate) {
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        queryConstraints.push(where("createdAt", ">=", startOfDay), where("createdAt", "<=", endOfDay));
      }
  
      const q = query(collection(db, "orders"), ...queryConstraints);
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            customerName: data.customerName,
            items: data.items,
            total: data.total,
            paymentMethod: data.paymentMethod,
            status: data.status,
            createdAt: data.createdAt.toDate(),
          });
        });
  
        // Vérifier si une nouvelle commande a été ajoutée
        // if (ordersData.length > previousOrders.length) {
        //   playSuccessSound();
        // }
  
        setOrders(ordersData);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      });
  
      // Total orders count logic remains the same
      const totalOrdersQuery = query(collection(db, "orders"));
      const totalOrdersSnapshot = await getDocs(totalOrdersQuery);
      setTotalOrders(totalOrdersSnapshot.size);
  
      return () => unsubscribe();
    };
  
    loadOrders();
  }, [pageSize, currentPage, filterDate]); // Ajout du filtre comme dépendance // Changer la taille de la page
  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setCurrentPage(1) // Réinitialiser à la première page
    setLastVisible(null) // Réinitialiser le point de départ de la pagination
  }

  // Aller à la page suivante
  const nextPage = () => {
    if (orders.length < pageSize) return // Pas de page suivante s'il n'y a plus de commandes
    setCurrentPage(currentPage + 1)
  }

  // Aller à la page précédente
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus })
  }

  const filteredOrders = orders.filter(
    (order) =>
      (order.customerName?.toLowerCase() || "").includes(filter.toLowerCase()) ||
      (order.id?.toLowerCase() || "").includes(filter.toLowerCase())
  )

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    } else {
      return sortOrder === "asc" ? a.total - b.total : b.total - a.total
    }
  })

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      {/* commande today */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <OrdersToday />
      </Card>
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <h1 className="text-3xl font-bold m-6">Orders Management</h1>

        <div className="flex justify-between m-4">
          <Input
            placeholder="Search by customer name or order ID"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex space-x-2">
          <div>
  {/* <label htmlFor="date-filter">Filter by date:</label> */}
  <Input
    type="date"
    id="date-filter"
    value={filterDate}
    onChange={(e) => setFilterDate(e.target.value)} // Ici on manipule un autre état pour la date
    className="border p-2 rounded"
  />
</div>
            <Select onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handlePageSizeChange(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.customerName || "N/A"}</TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.createdAt.toLocaleString()}</TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <Button onClick={prevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {Math.ceil(totalOrders / pageSize)}
          </span>
          <Button onClick={nextPage} disabled={orders.length < pageSize}>
            Next
          </Button>
        </div>
      </Card>
    </ErrorBoundary>
  )
}
