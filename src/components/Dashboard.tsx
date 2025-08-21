'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Package, Clock } from 'lucide-react';
import { Appointment, Customer, Product } from '@/types';
import AppointmentRequests from './AppointmentRequests';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalCustomers: 0,
    lowStockProducts: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await fetch(`/api/appointments?date=${today}`);
      const todayAppointments = await appointmentsResponse.json();

      // Fetch all customers
      const customersResponse = await fetch('/api/customers');
      const customers = await customersResponse.json();

      // Fetch products
      const productsResponse = await fetch('/api/products');
      const products = await productsResponse.json();

      // Fetch this month's appointments for statistics (if needed for future features)
      // const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      // const monthlyResponse = await fetch(`/api/appointments?month=${monthStart.slice(0, 7)}`);
      // const monthlyAppointments = await monthlyResponse.json();

      // Calculate stats
      const lowStockProducts = products.filter((p: Product) => (p.quantity || 0) <= (p.minimum_stock || 0));

      setStats({
        todayAppointments: todayAppointments.length,
        totalCustomers: customers.length,
        lowStockProducts: lowStockProducts.length
      });

      // Set upcoming appointments (next 3 days)
      const nextDays: string[] = [];
      for (let i = 1; i <= 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        nextDays.push(date.toISOString().split('T')[0]);
      }

      const upcomingResponse = await fetch(`/api/appointments`);
      const allAppointments = await upcomingResponse.json();
      const upcoming = allAppointments
        .filter((a: Appointment) => nextDays.includes(a.date))
        .slice(0, 5);

      setUpcomingAppointments(upcoming);
      setRecentCustomers(customers.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Benvenuta nel gestionale di Gresilda Hairstyle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Appuntamenti Oggi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clienti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prodotti Scorte Basse</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prossimi Appuntamenti */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Prossimi Appuntamenti</h2>
          </div>
          
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nessun appuntamento nei prossimi giorni</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.customer_name || 'Cliente non specificato'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString('it-IT')} alle {appointment.time}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.service}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{appointment.duration || 60} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clienti Recenti */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Clienti Recenti</h2>
          </div>
          
          {recentCustomers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nessun cliente registrato</p>
          ) : (
            <div className="space-y-3">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </p>
                    {customer.phone && (
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    )}
                  </div>
                  {customer.birthday && (
                    <div className="text-xs text-gray-500 text-right">
                      <p>Compleanno:</p>
                      <p>{new Date(customer.birthday).toLocaleDateString('it-IT')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Richieste Appuntamenti dal Sito Web */}
      <div className="mb-8">
        <AppointmentRequests />
      </div>
    </div>
  );
}
