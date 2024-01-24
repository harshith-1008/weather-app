import React, { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import 'date-fns';

export default function Display(){
    const [area, setArea] = useState("Hyderabad");
    const [country, setCountry] = useState("");
    const [weatherData, setWeatherData] = useState({});
    const [geoData, setGeoData] = useState({});
    const [state, setState] = useState("Telangana")
    const [forecast, setForecast] = useState({});
    const [outCountry, setOutCountry] = useState('India')
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [labels, setLabels] = useState([]);
    const [temperatures, setTemperatures] = useState([]);
    const [localTime, setLocalTime] = useState("")
  
    const getGeo = async () => {
      try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=8d54698f9f164c99bd3d6561893ccdd0&q=${area}%2C+${country}&pretty=1`);
        const data = await response.json();
        setArea(data.results[0].components.city);
        setState(data.results[0].components.state);
        setOutCountry(data.results[0].components.country)
        setGeoData(data);
        if (data.results && data.results.length > 0) {
          const localTime = formatLocalTime(data.dt, data.results[0].annotations.timezone.short_name);
          setLocalTime(localTime);
        }
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=17.360589&lon=78.4740613&appid=8f0c1c4803e2789644117362a5a69453');
          const data = await response.json();
          setWeatherData(data);
          if (geoData.results && geoData.results.length > 0) {
            const localTime = formatLocalTime(data.dt, geoData.results[0].annotations.timezone.short_name);
            setLocalTime(localTime);
          }
          const response1 = await fetch('https://api.openweathermap.org/data/2.5/forecast?lat=17.360589&lon=78.4740613&appid=8f0c1c4803e2789644117362a5a69453') ;
          const data1 = await response1.json();
          setForecast(data1);
          if (data1.list && data1.list.length > 0) {
            createTemperatureChart(data1.list);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }, [geoData.results]);

    useEffect(() => {
      if (geoData.results && geoData.results.length > 0) {
        const { lat, lng } = geoData.results[0].geometry;
        const fetchWeatherData = async () => {
          try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=8f0c1c4803e2789644117362a5a69453`);
            const data = await response.json();
            setWeatherData(data);
            const response1 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=8f0c1c4803e2789644117362a5a69453`) ;
            const data1 = await response1.json();
            setForecast(data1);
            if (data1.list && data1.list.length > 0) {
              createTemperatureChart(data1.list);
            }
          } catch (error) {
            console.log(error);
          }
        };
        fetchWeatherData();
      }
    }, [geoData]);

    const formatLocalTime = (timestamp, timezone) => {
        const localDate = new Date(timestamp * 1000).toLocaleString('en-US', { timeZone: timezone });
        return localDate;
    };

    useEffect(() => {
        // Create chart only once when both forecast and chartRef are available
        if (forecast && chartRef.current) {
            if (chartInstance.current) {
              chartInstance.current.destroy();
            }
    
            chartInstance.current = new Chart(chartRef.current, {
            type: "line",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Temperature (°C)",
                  data: temperatures,
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                  fill: false,
                },
              ],
            },
            options: {
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: 'day',
                    displayFormats: {
                      day: 'MMM d',
                    },
                  },
                  title: {
                    display: true,
                    text: "Date",
                  },
                },
                y: {
                  type: "linear",
                  position: "left",
                  title: {
                    display: true,
                    text: "Temperature (°C)",
                  },
                },
              },
            },
          });
        }
      }, [forecast]);
    
      const createTemperatureChart = (forecastList) => {
        if (chartInstance.current) {
          const dailyData = {};
          forecastList.forEach((data) => {
            const date = data.dt_txt.split(' ')[0];
            if (!dailyData[date]) {
              dailyData[date] = [data];
            } else {
              dailyData[date].push(data);
            }
          });

          const labels = Object.keys(dailyData);
          const temperatures = labels.map((date) => {
            const dailyTemps = dailyData[date].map((data) => data.main.temp - 273.15);
            const avgTemp = dailyTemps.reduce((acc, temp) => acc + temp, 0) / dailyTemps.length;
            return avgTemp;
          });
          
            setLabels(labels);
            setTemperatures(temperatures);
          chartInstance.current.data.labels = labels;
          chartInstance.current.data.datasets[0].data = temperatures;
          chartInstance.current.update();
        }
    }

    console.log(localTime)
    return(
        <div className="flex bg-sky-200 h-screen w-screen items-center justify-center">
            <div flex className="flex-col bg-white w-4/5 p-16 items-center rounded-xl">
                <div className="flex-row flex items-center">
                    <div className="flex flex-col">
                        <label className="flex flex-row mb-2">
                            City/region:
                            <input type="text" className="ml-2 border-2 border-slate-600 rounded-md pl-2" placeholder="Hyderabad" value={area} onChange={(e) => setArea(e.target.value)}></input>
                        </label>
                        <label className="flex flex-row">
                          Country:
                            <input type="text" className=" ml-[1.68rem] border-2 border-slate-600 rounded-md pl-2" placeholder="optional" value={country}  onChange={(e) => setCountry(e.target.value)}></input>
                        </label>
                    </div>
                    <button className="h-[4rem] w-[10rem] bg-sky-300 hover:bg-white hover:text-sky-200 hover:border-[0.2rem] hover:border-sky-200 text-white items-center ml-10 flex justify-center rounded-lg font-extrabold text-xl" onClick={getGeo}><p>Search</p></button>
                </div>
                <div className="flex flex-row items-center">
                    <div className="flex flex-col items-center basis-1/3 mr-2 justify-center">
                        <p className="text-gray-400">Local time:  {localTime}</p>
                        <div className="flex flex-row items-center text-5xl">{weatherData.weather && (<img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} className="size-48" alt="weather icon" />)}
                        <p className=" text-2xl">{weatherData.main && (weatherData.main.temp - 273).toFixed(0)} °C</p>
                        </div>
                        <div className="mb-3 flex ">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                            <p>{{state} && `${weatherData.name},${state}-${outCountry}`}</p>
                        </div>
                        <div className="flex flex-row items-center ">
                            <div className="flex flex-col items-center mr-12">
                                <p className="text-xl text-gray-400">Humidity</p>
                                <p className="text-lg">{weatherData.main && (weatherData.main.humidity)}%</p>
                            </div>
                            <div className="flex flex-col items-center ">
                                <p className="text-xl text-gray-400">Wind speed</p>
                                <p className="text-lg">{weatherData.wind && ((weatherData.wind.speed*3600)/1000).toFixed(1)}km/h</p>
                            </div>
                        </div>
                    </div>
                    <div className="basis-2/3 flex flex-col p-2 ml-5">
                        <div className=" basis-1/2 mb-2">
                            <div>
                                <canvas ref={chartRef} width="400" height="200"></canvas>
                            </div>
                        </div>
                            <div className="flex flex-row basis-1/2">
                                <div className="rounded-lg  mr-2 ml-2 basis-1/4 justify-center items-center flex flex-col bg-sky-300 pt-6 pb-6 text-white"> 
                                    <p className=" font-bold">Today</p>
                                    {weatherData.weather && (<img src={forecast && forecast.list && forecast.list.length > 0 && (`https://openweathermap.org/img/wn/${forecast.list[0].weather[0].icon}@2x.png`)} className=" size-14" alt="weather icon" />)} 
                                    <p className="font-extralight text-gray-500">Humidity</p>
                                    <p>{forecast && forecast.list && forecast.list.length > 0 && (forecast.list[0].main.humidity)}%</p>
                                </div>
                                <div className=" rounded-lg  mr-2 ml-2 basis-1/4 justify-center items-center flex flex-col bg-sky-300 pt-6 pb-6 text-white">
                                    <p className=" font-bold">today</p>
                                    {weatherData.weather && (<img src={forecast && forecast.list && forecast.list.length > 0 && (`https://openweathermap.org/img/wn/${forecast.list[1].weather[0].icon}@2x.png`)} className=" size-14" alt="weather icon" />)}
                                    <p className="font-extralight text-gray-500">Humidity</p>
                                    <p>{forecast && forecast.list && forecast.list.length > 0 && (forecast.list[1].main.humidity)}%</p>
                                </div>
                                <div className=" rounded-lg  mr-2 ml-2 basis-1/4 justify-center items-center flex flex-col bg-sky-300 pt-6 pb-6 text-white">
                                    <p className=" font-bold">today</p>
                                    {weatherData.weather && (<img src={forecast && forecast.list && forecast.list.length > 0 && (`https://openweathermap.org/img/wn/${forecast.list[2].weather[0].icon}@2x.png`)} className=" size-14" alt="weather icon" />)}
                                    <p className="font-extralight text-gray-500">Humidity</p>
                                    <p>{forecast && forecast.list && forecast.list.length > 0 && (forecast.list[2].main.humidity)}%</p>
                                </div>
                                <div className=" rounded-lg  mr-2 ml-2 basis-1/4 justify-center items-center flex flex-col bg-sky-300 pt-6 pb-6 text-white">
                                    <p className=" font-bold">today</p>
                                    {weatherData.weather && (<img src={forecast && forecast.list && forecast.list.length > 0 && (`https://openweathermap.org/img/wn/${forecast.list[3].weather[0].icon}@2x.png`)} className=" size-14" alt="weather icon" />)}
                                    <p className="font-extralight text-gray-500">Humidity</p>
                                    <p>{forecast && forecast.list && forecast.list.length > 0 && (forecast.list[3].main.humidity)}%</p>
                                </div>  
                        </div>         
                    </div>
                </div>
            </div>
        </div>
    )
}