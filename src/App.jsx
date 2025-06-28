import React, { useState, useEffect } from "react";
import { differenceInMinutes, setHours, setMinutes, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import timezones from "./utils.json"; /
const TimezoneMeetingFinder = () => {
  const [cities, setCities] = useState([""]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeRange = { start: 9, end: 20 }; 

  const getTimeZone = (input) => {
    return timezones.find((z) => z.toLowerCase().includes(input.toLowerCase())) || null;
  };

  const handleAddCity = () => setCities([...cities, ""]);

  const handleCityChange = (value, index) => {
    const updated = [...cities];
    updated[index] = value;
    setCities(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const tzInfo = cities.map((city) => getTimeZone(city));

    if (tzInfo.includes(null)) {
      alert("One or more time zones not found.");
      setLoading(false);
      return;
    }

    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const utcDate = new Date();
      utcDate.setUTCHours(hour, 0, 0, 0);

      const localHours = tzInfo.map((zone) => {
        const local = toZonedTime(utcDate, zone);
        return local.getHours();
      });

      const allAvailable = localHours.every(
        (h) => h >= timeRange.start && h <= timeRange.end
      );

      if (allAvailable) {
        slots.push(utcDate);
      }
    }

    const suggestions = slots.map((utcDate) => {
      return tzInfo.map((zone) => {
        const local = toZonedTime(utcDate, zone);
        return `${format(local, "hh:mm a")} (${zone})`;
      });
    });

    setResults(suggestions);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Virtual Meeting Time Finder</h1>
      {cities.map((city, index) => (
        <input
          key={index}
          className="mb-2 border p-2 w-full"
          placeholder={`Enter city or country ${index + 1}`}
          value={city}
          onChange={(e) => handleCityChange(e.target.value, index)}
        />
      ))}
      <button onClick={handleAddCity} className="mb-4 mr-2 bg-blue-500 text-white px-4 py-2 rounded">
        Add City
      </button>
      <button onClick={handleSubmit} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
        {loading ? "Calculating..." : "Find Overlapping Times"}
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Suggested Meeting Times</h2>
          {results.map((row, i) => (
            <div key={i} className="border p-4 mb-2 rounded bg-gray-100">
              {row.map((time, j) => (
                <div key={j}>{time}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimezoneMeetingFinder;
