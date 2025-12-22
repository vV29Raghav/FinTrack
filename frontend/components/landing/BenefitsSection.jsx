'use client';

import { 
  Receipt, 
  Plane, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Clock,
  Users,
  CreditCard 
} from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Receipt size={32} />,
      title: 'Expense Management',
      description: 'Track all your expenses in one place with easy categorization and tagging.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Plane size={32} />,
      title: 'Travel Expenses',
      description: 'Manage travel costs, hotel bookings, and transportation expenses effortlessly.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <FileText size={32} />,
      title: 'Invoice Management',
      description: 'Create, send, and track invoices with automated reminders and payment tracking.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <DollarSign size={32} />,
      title: 'Reimbursements',
      description: 'Streamline reimbursement processes with automatic approval workflows.',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Reports & Analytics',
      description: 'Generate detailed reports and gain insights into spending patterns.',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      icon: <Clock size={32} />,
      title: 'Time Tracking',
      description: 'Track time spent on projects and link it to expenses for accurate billing.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: <Users size={32} />,
      title: 'Team Collaboration',
      description: 'Invite team members, assign roles, and collaborate on expense management.',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: <CreditCard size={32} />,
      title: 'Payment Integration',
      description: 'Connect with popular payment gateways for seamless transactions.',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Expenses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to make expense management simple and efficient for everyone.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${benefit.gradient} rounded-lg flex items-center justify-center mb-4 text-white`}
                role="img"
                aria-label={benefit.title}
              >
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
