"use client"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Employee {
  id: string
  name: string
  role: string
  schedule: { [key: string]: string }
  performance: number
}

const roles = ["Admin", "Server", "Cook", "Cashier"]
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function StaffManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({
    name: "",
    role: "",
    schedule: {},
    performance: 0,
  })

  useEffect(() => {
    const q = query(collection(db, "employees"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const employeesData: Employee[] = []
      querySnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as Employee)
      })
      setEmployees(employeesData)
    })

    return () => unsubscribe()
  }, [])

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    await addDoc(collection(db, "employees"), newEmployee)
    setNewEmployee({ name: "", role: "", schedule: {}, performance: 0 })
  }

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    await updateDoc(doc(db, "employees", id), data)
  }

  const deleteEmployee = async (id: string) => {
    await deleteDoc(doc(db, "employees", id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Management</h1>

      {/* Add New Employee Form */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addEmployee} className="space-y-4">
            <Input
              placeholder="Employee Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              required
            />
            <Select onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Add Employee</Button>
          </form>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.performance}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mr-2">
                          Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{employee.name}'s Schedule</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          {days.map((day) => (
                            <div key={day} className="flex items-center justify-between">
                              <span>{day}</span>
                              <Input
                                type="text"
                                placeholder="e.g. 9:00-17:00"
                                value={employee.schedule[day] || ""}
                                onChange={(e) =>
                                  updateEmployee(employee.id, {
                                    schedule: { ...employee.schedule, [day]: e.target.value },
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" onClick={() => deleteEmployee(employee.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

