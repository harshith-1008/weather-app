import React, { useEffect, useState } from "react";

export default function Display(){
    const [area, setArea] = useState("hyderabad");
    const [country, setCountry] = useState("India");
    const [weatherData, setWeatherData] = useState({});
    const [geoData, setGeoData] = useState({});
    const [state, setState] = useState("Telangana")
    const [timeData, setTimeData] = useState({});
  
    const getGeo = async () => {
      try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=8d54698f9f164c99bd3d6561893ccdd0&q=${area}%2C+${country}&pretty=1`);
        const data = await response.json();
        setState(data.results[0].components.state)
        setGeoData(data);
        fetchTimeData();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchTimeData = async () => {
        try {
          const response = await fetch(
            `http://worldtimeapi.org/api/timezone/${geoData.timezone.name}`
          );
          const data = await response.json();
          setTimeData(data);
        } catch (error) {
          console.log(error);
        }
      };
    console.log(timeData)
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=17.360589&lon=78.4740613&appid=8f0c1c4803e2789644117362a5a69453');
          const data = await response.json();
          setWeatherData(data);
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }, []);

    useEffect(() => {
      if (geoData.results && geoData.results.length > 0) {
        const { lat, lng } = geoData.results[0].geometry;
        const fetchWeatherData = async () => {
          try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=8f0c1c4803e2789644117362a5a69453`);
            const data = await response.json();
            setWeatherData(data);
          } catch (error) {
            console.log(error);
          }
        };
        fetchWeatherData();
      }
    }, [geoData]);

    return(
        <div className="flex bg-sky-200 h-screen w-screen items-center justify-center">
            <div flex className="flex-col bg-white w-4/5 h-4/5 p-16 items-center rounded-xl">
                <div className="mb-20 flex-row flex items-center">
                    <div className="flex flex-col">
                        <label className="flex flex-row mb-2">
                            City/region:
                            <input type="text" className="ml-2 border-2 border-slate-600 rounded-md pl-2" placeholder="Hyderabad" value={area} onChange={(e) => setArea(e.target.value)}></input>
                        </label>
                        <label className="flex flex-row">
                          Country:
                            <input type="text" className=" ml-[1.68rem] border-2 border-slate-600 rounded-md pl-2" placeholder="India" value={country}  onChange={(e) => setCountry(e.target.value)}></input>
                        </label>
                    </div>
                    <button className="h-[4rem] w-[10rem] bg-sky-300 hover:bg-white hover:text-sky-200 hover:border-[0.2rem] hover:border-sky-200 text-white items-center ml-10 flex justify-center rounded-lg font-extrabold text-xl" onClick={getGeo}><p>Search</p></button>
                </div>
                <div className="flex flex-row items-center">
                    <div className="flex flex-col items-center ">
                        <p className="text-gray-400">5:05 PM, Mon, Nov 23, 2020</p>
                        <div className="flex flex-row items-center text-5xl">{weatherData.weather && (<img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} className="size-48" alt="weather icon" />)}
                        <p>{weatherData.main && (weatherData.main.temp - 273).toFixed(0)} °C</p>
                        </div>
                        <div className="mb-3 flex">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                            <p>{{state} && `${area},${state}`}</p>
                        </div>
                        <div className="flex flex-row items-center pl-10">
                            <div className="flex flex-col items-center mr-16">
                                <p className="text-2xl text-gray-400">Humidity</p>
                                <p className="text-lg">{weatherData.main && weatherData.main.humidity}%</p>
                            </div>
                            <div className="flex flex-col items-center ">
                                <p className="text-2xl text-gray-400">Wind speed</p>
                                <p className="text-lg">{weatherData.wind && ((weatherData.wind.speed*3600)/1000)}km/h</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}