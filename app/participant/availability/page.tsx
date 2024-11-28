"use client";
import React, { useEffect, useState } from "react";
import { MdAccessAlarms } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import axios from "axios";
import { CheckSlotsInput, Participant } from "@/app/util/type";
import { participants as participantMock} from "@/app/util/data";


const ParticipantAvailability: React.FC = () => {
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [participants, setParticipants] = useState<Partial<Participant>>({});


  const getParticipants= async ()=>{
    try {
      const response = await axios.get("/api/metadata/participant");
      console.log("response",response);
      // setParticipants(response.data||participantMock); // need to change the format for participant string to number when get it from redis 
      setParticipants(participantMock); 
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  }
  useEffect(()=>{
    getParticipants()
  },[])
  const handleCheckSlots = async () => {
    const newErrors: Record<string, string> = {};

    // Validation
    if (selectedParticipants.length === 0) {
      newErrors.participants = "Please select at least one participant.";
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required.";
    }
    if (!endDate) {
      newErrors.endDate = "End date is required.";
    } else if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = "End date cannot be earlier than start date.";
    }

    setErrors(newErrors);

    // If there are errors, do not proceed
    if (Object.keys(newErrors).length > 0) return;

    // Format dates as "DD/MM/YYYY"
    const formatDate = (date: string): string => {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    };

    const input: CheckSlotsInput = {
      participant_ids: selectedParticipants,
      date_range: {
        start: startDate ? formatDate(startDate) : null,
        end: endDate ? formatDate(endDate) : null,
      },
    };

    try {
      const response = await axios.post("/api/check-slots", input);
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleParticipantSelection = (id: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    if (errors.participants) {
      setErrors((prevErrors) => ({ ...prevErrors, participants: "" }));
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="p-6 w-full max-w-lg sm:max-w-md md:max-w-xl lg:max-w-2xl h-auto mt-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Check Availability
        </h1>
        <div className="flex w-full justify-center items-center">
          <div className="mb-4 relative">
            <div className="dropdown inline-block w-full mt-6 mb-2">
              <button
                className="bg-[#ebebeb] text-[#6d6d6f] font-semibold py-2 px-4 w-full rounded inline-flex items-center justify-between"
                onClick={toggleDropdown}
              >
                <span className="mr-1">
                  Choose Participants
                </span>
                <FaAngleDown />
              </button>
            </div>
            {isDropdownOpen && (
              <div className="flex flex-col gap-2 bg-[#ebebeb] text-[#6d6d6f] px-4 py-2 mb-4">
                {Object.entries(participants).map(([id, { name }]) => (
                  <div key={id}>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 focus:ring-offset-0 disabled:cursor-not-allowed disabled:text-gray-400"
                        checked={selectedParticipants.includes(Number(id))}
                        onChange={() => handleParticipantSelection(Number(id))}
                      />
                      <span className="ml-2">{name}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
            {errors.participants && (
              <p className="text-red-500 text-sm">{errors.participants}</p>
            )}

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <input
                  type="date"
                  className="border rounded w-full p-2 text-gray-700"
                  value={startDate || ""}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        startDate: "",
                      }));
                    }
                  }}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm">{errors.startDate}</p>
                )}
              </div>
              <div>
                <input
                  type="date"
                  className="border rounded w-full p-2 text-gray-700"
                  value={endDate || ""}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.endDate) {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        endDate: "",
                      }));
                    }
                  }}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm">{errors.endDate}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleCheckSlots}
              className="w-full bg-[#645cce] text-white py-2 rounded hover:bg-[#3c3786] transition"
            >
              Check Slot
            </button>
          </div>
        </div>
        {Object.keys(slots).length > 0 && (
          <div className="mt-4 border p-4 rounded-lg bg-[#f3f0e9]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center underline underline-offset-1">
              Available Slot
            </h2>
            {Object.entries(slots).map(([date, timeSlots]) => (
              <div key={date} className="my-6">
                <div className="flex flex-wrap gap-6 my-2 justify-between">
                  <h3 className="text-[#6d6d6f] font-medium">{date}</h3>
                  <p className="text-[#6d6d6f]">:</p>
                  {timeSlots.map((slot) => (
                    <span
                      key={slot}
                      className="bg-[#645cce] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <MdAccessAlarms />
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantAvailability;
