import React from 'react';
import { Calendar, Users, Heart, Award, Target, Shield } from 'lucide-react';

const AboutUs = () => {
  const missionPoints = [
    {
      icon: <Heart size={24} className="text-red-500" />,
      title: "Compassionate Care",
      description: "Providing empathetic and comprehensive care to those in need, ensuring dignity and comfort in every interaction."
    },
    {
      icon: <Target size={24} className="text-blue-500" />,
      title: "Community Support",
      description: "Building a strong network of support within our community to help patients and their families navigate challenging times."
    },
    {
      icon: <Shield size={24} className="text-green-500" />,
      title: "Quality Service",
      description: "Maintaining the highest standards of medical care and professional service in palliative care delivery."
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Medical Director",
      image: "/api/placeholder/400/400"
    },
    {
      name: "Dr. James Wilson",
      role: "Chief Physician",
      image: "/api/placeholder/400/400"
    },
    {
      name: "Mary Thompson",
      role: "Head Nurse",
      image: "/api/placeholder/400/400"
    },
    {
      name: "Robert Davis",
      role: "Volunteer Coordinator",
      image: "/api/placeholder/400/400"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/api/placeholder/1920/600"
            alt="About Us Banner"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Dedicated to providing compassionate palliative care and support to our community since 2013
            </p>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2013, Pain & Palliative Care Pookkottumpadam began with a simple mission: to provide 
                  compassionate care to those facing serious illness in our community.
                </p>
                <p>
                  What started as a small team of dedicated volunteers has grown into a comprehensive palliative 
                  care center, serving hundreds of patients and their families each year.
                </p>
                <p>
                  Today, we continue to expand our services while maintaining our core values of compassion, 
                  dignity, and excellence in care.
                </p>
              </div>
            </div>
            <div className="relative h-96">
              <img
                src="/api/placeholder/600/400"
                alt="Our History"
                className="rounded-lg shadow-xl w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Values */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missionPoints.map((point, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4 mx-auto">
                  {point.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">{point.title}</h3>
                <p className="text-gray-600 text-center">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Team Members */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">10,000+</h3>
              <p className="text-gray-600">Patients Served</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Calendar size={48} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">10+ Years</h3>
              <p className="text-gray-600">Of Dedicated Service</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Award size={48} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Multiple Awards</h3>
              <p className="text-gray-600">For Excellence in Care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether as a volunteer, donor, or supporter, you can make a difference in someone's life.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300">
            Get Involved
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;