import SunnyIcon from "../media/elements/weather/sunny.png";
import ClearCloudyIcon from "../media/elements/weather/clear-cloudy.png";
import PartlyCloudyIcon from "../media/elements/weather/partly-cloudy.png";
import CloudyIcon from "../media/elements/weather/cloudy.png";
import MostlyCloudyIcon from "../media/elements/weather/mostly-cloudy.png";
import DrizzleIcon from "../media/elements/weather/drizzle.png";
import ShowersIcon from "../media/elements/weather/showers.png";
import SnowIcon from "../media/elements/weather/snow.png";
import SnowFlurriesIcon from "../media/elements/weather/snow-flurries.png";
import SleetIcon from "../media/elements/weather/sleet.png";
import ThunderstormsIcon from "../media/elements/weather/thunderstroms.png";
import HailIcon from "../media/elements/weather/hail.png";

const WEATHER_CODE_MAP = {
  0: { label: "Clear", description: "clear sky", icon: SunnyIcon },
  1: { label: "Mainly clear", description: "mainly clear", icon: ClearCloudyIcon },
  2: { label: "Partly cloudy", description: "partly cloudy", icon: PartlyCloudyIcon },
  3: { label: "Overcast", description: "overcast", icon: CloudyIcon },
  45: { label: "Fog", description: "fog", icon: MostlyCloudyIcon },
  48: { label: "Rime fog", description: "depositing rime fog", icon: MostlyCloudyIcon },
  51: { label: "Light drizzle", description: "light drizzle", icon: DrizzleIcon },
  53: { label: "Drizzle", description: "moderate drizzle", icon: DrizzleIcon },
  55: { label: "Heavy drizzle", description: "dense drizzle", icon: DrizzleIcon },
  56: { label: "Freezing drizzle", description: "light freezing drizzle", icon: SleetIcon },
  57: { label: "Freezing drizzle", description: "dense freezing drizzle", icon: SleetIcon },
  61: { label: "Light rain", description: "slight rain", icon: ShowersIcon },
  63: { label: "Rain", description: "moderate rain", icon: ShowersIcon },
  65: { label: "Heavy rain", description: "heavy rain", icon: ShowersIcon },
  66: { label: "Freezing rain", description: "light freezing rain", icon: SleetIcon },
  67: { label: "Freezing rain", description: "heavy freezing rain", icon: HailIcon },
  71: { label: "Light snow", description: "slight snow fall", icon: SnowFlurriesIcon },
  73: { label: "Snow", description: "moderate snow fall", icon: SnowIcon },
  75: { label: "Heavy snow", description: "heavy snow fall", icon: SnowIcon },
  77: { label: "Snow grains", description: "snow grains", icon: SnowFlurriesIcon },
  80: { label: "Rain showers", description: "slight rain showers", icon: ShowersIcon },
  81: { label: "Rain showers", description: "moderate rain showers", icon: ShowersIcon },
  82: { label: "Heavy showers", description: "violent rain showers", icon: ShowersIcon },
  85: { label: "Snow showers", description: "slight snow showers", icon: SnowFlurriesIcon },
  86: { label: "Heavy snow showers", description: "heavy snow showers", icon: SnowIcon },
  95: { label: "Thunderstorm", description: "thunderstorm", icon: ThunderstormsIcon },
  96: { label: "Thunderstorm", description: "thunderstorm with slight hail", icon: HailIcon },
  99: { label: "Thunderstorm", description: "thunderstorm with heavy hail", icon: HailIcon },
};

const SEVERE_WEATHER_CODES = new Set([65, 67, 75, 82, 86, 95, 96, 99]);

export const getWeatherMeta = (weatherCode) =>
  WEATHER_CODE_MAP[weatherCode] || {
    label: "Unknown",
    description: "weather data unavailable",
    icon: CloudyIcon,
  };

export const getWeatherAlert = (weatherCode) =>
  SEVERE_WEATHER_CODES.has(weatherCode)
    ? getWeatherMeta(weatherCode).description
    : "None";
