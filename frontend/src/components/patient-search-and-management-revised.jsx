import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Trash2, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { url } from "../services/Url";
import toast from "react-hot-toast";
import { IoMdArrowRoundBack } from "react-icons/io";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { TbLogout2 } from "react-icons/tb";

const PatientSearchAndManagement = ({ isUser }) => {
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isLoading, setIsLoading] = useState();
  const [searchResults, setSearchResults] = useState([]);
  const [insideQuerry, setInsideQuerry] = useState("");

  const { register, handleSubmit, reset } = useForm();

  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || {};

  const handleSearch = (query) => {
    setInsideQuerry(query);

    // Filter the results
    const filteredResults = patients.filter(
      (patient) =>
        patient.UHID?.toLowerCase().includes(query.toLowerCase()) ||
        (patient.name &&
          patient.name.toLowerCase().includes(query.toLowerCase()))
    );
    

    // Use a Set to avoid duplicate UHID entries (you can also use other unique fields)
    const uniqueResults = Array.from(
      new Set(filteredResults.map((patient) => patient.UHID))
    ).map((uhid) => {
      return filteredResults.find((patient) => patient.UHID === uhid);
    });

    setSearchResults(uniqueResults);
  };

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await fetch(`${url}/patient/getAllPatients`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const getData = await response.json();

        // console.log("patient data:", getData.patients);
        setPatients(getData.patients);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setIsLoading(false);
    }

    fetchUsers();
  }, []);

  async function OnSubmit(data) {
    setButtonLoading(true);
    try {
      const response = await axios.post(`${url}/patient/register`, data);
      // console.log(data);
      if (response.status === 201) {
        toast.success("Patient Added Successfully");
        setPatients([...patients, response.data.patient]);
        reset();
        setShowNewPatientForm(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("ID already exists");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
    setButtonLoading(false);
  }

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex gap-2 relative">
            {" "}
            {role === "Staff" ? (
              <TbLogout2
                className="cursor-pointer text-xl absolute right-2"
                onClick={() => {
                  localStorage.removeItem("userData");
                  localStorage.removeItem("userId");
                  localStorage.removeItem("role");
                  toast.success("Logout Successfully");
                  navigate("/login");
                }}
              />
            ) : (
              <IoMdArrowRoundBack
                className="cursor-pointer"
                onClick={() => {
                  navigate(-1);
                }}
              />
            )}
            Patient Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search by name or UHID"
              className="flex-grow"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
            <Button onClick={() => setShowNewPatientForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> New Patient
            </Button>
          </div>
        </CardContent>
      </Card>

      {showNewPatientForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Patient Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(OnSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="uhid">UHID</Label>
                <Input
                  id="uhid"
                  placeholder="Enter Unique Health ID"
                  {...register("UHID", { required: "This field is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="LCN">Loyalty Card Number</Label>
                <Input
                  id="LCN"
                  placeholder="Enter Loyalty Card Number"
                  {...register("LoyalityCard", {
                    required: "This field is required",
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter patient's full name"
                  {...register("name", { required: "This field is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-points">Initial Points</Label>
                <Input
                  id="initial-points"
                  type="number"
                  placeholder="Enter initial points"
                  {...register("currentPoints", {
                    required: "This field is required",
                  })}
                />
              </div>
              <Button className="w-full">
                {" "}
                {buttonLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="dots text-white "></div>
                  </div>
                ) : (
                  "Register Patient"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {insideQuerry === "" && (
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-4 font-bold mb-2 p-2 bg-gray-100">
              <div>UHID</div>
              <div>Loyality Card Number</div>
              <div>Name</div>
              <div>Points</div>
              <div>Manage</div>
            </div>
            <div>
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <div className="spinner"></div>
                </div>
              ) : (
                patients.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-5 gap-4 p-2 border-b"
                  >
                    <div>{user.UHID}</div>
                    <div>{user.LoyalityCard}</div>
                    <div>{user.name}</div>
                    <div>{user.currentPoints}</div>
                    <div>
                      <Button
                        onClick={() => navigate(`/patient-point/${user.UHID}`)}
                        variant="outline"
                      >
                        Manage Points
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      )}

      {/* Search Results */}
      {insideQuerry !== "" && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((patient) => (
                <div
                  key={patient.UHID}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="font-bold">{patient.name}</p>
                    <p className="text-sm text-gray-500">
                      UHID: {patient.UHID}
                    </p>
                    <p className="text-sm">Points: {patient.currentPoints}</p>
                  </div>
                  <Button
                    onClick={() => navigate(`/patient-point/${patient.UHID}`)}
                    variant="outline"
                  >
                    Manage Points
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientSearchAndManagement;
