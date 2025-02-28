import { useMemo, useState } from "react";
import axios from "axios";
import { z } from "zod";
// import { object, string, number, Output, parse } from "valibot";
import { SearchType } from "../types";

//TYPE GUARDS o ASSERTION FUNCTIONS
//Funcion que nos permite validar si un objeto es de un tipo en especifico
// function isWeatherResponse(weather : unknown) : weather is Weather {
//   return (
//     Boolean(weather) &&
//     typeof weather === "object" &&
//     typeof (weather as Weather).name === "string" &&
//     typeof (weather as Weather).main.temp === "number" &&
//     typeof (weather as Weather).main.temp_max === "number" &&
//     typeof (weather as Weather).main.temp_min === "number"
//   )
// }

//Zod
//Creamos un esquema de validacion
const Weather = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    temp_max: z.number(),
    temp_min: z.number(),
  }),
});

// //Inferimos el tipo de dato
export type Weather = z.infer<typeof Weather>;

//Valibot
// const WeatherSchema = object({
//   name: string(),
//   main: object({
//     temp: number(),
//     temp_max: number(),
//     temp_min: number(),
//   }),
// });

// type Weather = Output<typeof WeatherSchema>;

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_max: 0,
    temp_min: 0,
  },
};

export default function useWeather() {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<Weather>(initialState);
  const [notFound, setNotFound] = useState(false);

  const fetchWeather = async (search: SearchType) => {
    const appId = import.meta.env.VITE_API_KEY;

    setLoading(true);
    setWeather(initialState);

    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;

      const { data } = await axios(geoUrl);
      // console.log("data", data);

      //Comprobar si existe
      if (!data[0]) {
        setNotFound(true);
        return;
      }

      const lat = data[0].lat;
      const lon = data[0].lon;

      // console.log("lat", lat);
      // console.log("lon", lon);

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;

      //Castear el tipo de dato (type)
      // const {data: weatherResult} = await axios<Weather>(weatherUrl);
      // console.log('weatherResult', weatherResult.main.temp_max);

      //Type Guards
      // const { data: weatherResult } = await axios(weatherUrl);
      // const result = isWeatherResponse(weatherResult)
      // if(result){
      //   console.log('weatherResult', weatherResult.name);
      // }else{
      //   console.log('No es un objeto de tipo Weather');
      // }

      //Zod
      const { data: weatherResult } = await axios(weatherUrl);
      // safeParse nos permite validar si el objeto es de tipo Weather
      const result = Weather.safeParse(weatherResult);
      console.log("result", result);
      if (result.success) {
        setWeather(result.data);
      } else {
        console.log("No es un objeto de tipo Weather");
      }

      //Valibot
      // const { data: weatherResult } = await axios(weatherUrl);
      // const result = parse(WeatherSchema, weatherResult);
      // if (result) {
      //   console.log("weatherResult", result.name);
      //   console.log("weatherResult", result.main.temp_max);
      //   console.log("weatherResult", result.main.temp_min);
      // }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const hasWeatherData = useMemo(() => weather.name, [weather]);

  return {
    weather,
    loading,
    notFound,
    fetchWeather,
    hasWeatherData,
  
  };
}
