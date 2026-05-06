import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Nav, Dropdown } from "react-bootstrap";

import "./home.scss";

import WindyElement from "../../media/elements/windy.svg";
import HumidityElement from "../../media/elements/hum.svg";
import FlowerGood from "../../media/elements/flower_good.svg";

import useAPI from "../../hooks/useAPI";
import useHourly from "../../hooks/useHourly";
import useCurrentLocation from "../../hooks/useCurrentLocation";
import useLocationName from "../../hooks/useLocationName";
import formatCurrentDate from "../../hooks/useFormattedDate";
import { getWeatherAlert, getWeatherMeta } from "../../utils/weatherCode";

const PRESET_LOCATIONS = {
  Manchester: { latitude: 53.4808, longitude: -2.2426 },
  Birmingham: { latitude: 52.4862, longitude: -1.8904 },
  Bristol: { latitude: 51.4545, longitude: -2.5879 },
  London: { latitude: 51.5074, longitude: 0.1278 },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatTemperature = (value) =>
  Number.isFinite(value) ? `${Math.round(value)}°C` : "--";

const formatHour = (value) => {
  if (!value) {
    return "--:--";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Home() {
  //apis for the location
  const { location } = useCurrentLocation();
  const { locationName: currentLocationName } = useLocationName(
    location?.latitude,
    location?.longitude,
  );
  const [selectedLocation, setSelectedLocation] = useState("Current");
  const activeLocation =
    selectedLocation === "Current"
      ? location
      : PRESET_LOCATIONS[selectedLocation];
  const activeLocationLabel =
    selectedLocation === "Current"
      ? currentLocationName?.[0]?.name || "Current Location"
      : selectedLocation;

  const currentDate = formatCurrentDate();

  //weather api
  const { data } = useAPI(activeLocation?.latitude, activeLocation?.longitude);
  const currentWeather = data?.current;
  const currentWeatherMeta = getWeatherMeta(currentWeather?.weather_code);

  //various weather informaiton
  const temp = Number.isFinite(currentWeather?.temperature_2m)
    ? Math.round(currentWeather.temperature_2m)
    : null;
  const humidity = Number.isFinite(currentWeather?.relative_humidity_2m)
    ? currentWeather.relative_humidity_2m
    : null;
  const wind = Number.isFinite(currentWeather?.wind_speed_10m)
    ? Math.round(currentWeather.wind_speed_10m)
    : null;
  const description = currentWeatherMeta.label;
  const icon = currentWeatherMeta.icon;

  //using the hourly forecast
  const { dataH } = useHourly(
    activeLocation?.latitude,
    activeLocation?.longitude,
  );
  const timeline =
    dataH?.hourly?.time?.map((time, index) => ({
      time,
      temp: dataH?.hourly?.temperature_2m?.[index],
      weatherCode: dataH?.hourly?.weather_code?.[index],
      humidity: dataH?.hourly?.relative_humidity_2m?.[index],
      precipitationProbability:
        dataH?.hourly?.precipitation_probability?.[index],
      soilMoisture: dataH?.hourly?.soil_moisture_0_to_1cm?.[index],
    })) || [];
  const currentIndex = timeline.findIndex(
    (entry) => entry.time === dataH?.current?.time,
  );
  const resolvedCurrentIndex = currentIndex >= 0 ? currentIndex : 3;
  const pastTimeline = timeline.slice(
    Math.max(0, resolvedCurrentIndex - 3),
    resolvedCurrentIndex,
  );
  const futureTimeline = timeline.slice(
    resolvedCurrentIndex + 1,
    resolvedCurrentIndex + 4,
  );
  const currentTimeline = timeline[resolvedCurrentIndex];
  const nextTwelveHours = timeline.slice(
    resolvedCurrentIndex,
    resolvedCurrentIndex + 12,
  );

  // differnet features for farmers
  const frosting =
    temp == null ? "--" : temp <= 0 ? "High" : temp < 4 ? "Moderate" : "Low";
  const currentAlertWarning = getWeatherAlert(currentWeather?.weather_code);
  const hasUpcomingSevereWeather = nextTwelveHours.some(
    (entry) => getWeatherAlert(entry.weatherCode) !== "None",
  );
  const maxPrecipitationProbability = nextTwelveHours.length
    ? Math.max(
        ...nextTwelveHours.map((entry) =>
          Number.isFinite(entry.precipitationProbability)
            ? entry.precipitationProbability
            : 0,
        ),
      )
    : 0;
  const alertWarning = hasUpcomingSevereWeather
    ? "Severe conditions expected"
    : currentAlertWarning;

  const currentSoilMoisture = currentTimeline?.soilMoisture;
  const vwc = Number.isFinite(currentSoilMoisture)
    ? Math.round(currentSoilMoisture * 100)
    : null;

  const minimumFutureTemp = futureTimeline.length
    ? Math.min(
        ...futureTimeline.map((entry) =>
          Number.isFinite(entry.temp) ? entry.temp : Number.POSITIVE_INFINITY,
        ),
      )
    : temp;

  const averageHumidity = nextTwelveHours.length
    ? nextTwelveHours.reduce(
        (sum, entry) =>
          sum + (Number.isFinite(entry.humidity) ? entry.humidity : 0),
        0,
      ) / nextTwelveHours.length
    : humidity;

  const pestInfection =
    Number.isFinite(averageHumidity) && temp != null
      ? clamp(
          Math.round(
            (averageHumidity - 55) * 0.9 +
              clamp(maxPrecipitationProbability - 35, 0, 65) * 0.35 +
              (temp >= 18 && temp <= 30 ? 18 : 5),
          ),
          0,
          100,
        )
      : null;

  const tempPercentage =
    temp == null ? 0 : clamp(20 - Math.abs(temp - 21) * 2, 0, 20);
  const vwcPercentage = vwc == null ? 0 : clamp(20 - Math.abs(vwc - 30), 0, 20);
  const alertWarningPercentage = hasUpcomingSevereWeather
    ? 0
    : clamp(20 - maxPrecipitationProbability / 5, 4, 20);
  const frostingPercentage =
    minimumFutureTemp == null || minimumFutureTemp === Number.POSITIVE_INFINITY
      ? 0
      : minimumFutureTemp <= 0
        ? 0
        : minimumFutureTemp < 4
          ? 10
          : 20;
  const pestInfectionPercentage =
    pestInfection == null ? 0 : clamp(20 - pestInfection / 5, 0, 20);

  const overallPercentage = Math.round(
    tempPercentage +
      vwcPercentage +
      alertWarningPercentage +
      frostingPercentage +
      pestInfectionPercentage,
  );

  return (
    <>
      <div className="row px-2 pt-0">
        {/* WEATHER BASIC INFO SECTION */}
        <div className="col col-sm-12 bg-primary px-4 border-30">
          <div className="row justify-content-center">
            <div className="col col-md-6 d-flex justify-content-center container-fluid">
              <div className="row w-100 bg-image-1 border-30 justify-content-center">
                <div className="col col-sm-12 d-flex justify-content-center text-light text-shadow-sm">
                  <p className="h4">{currentDate} - Today</p>
                </div>

                <div className="col col-sm-8 d-flex justify-content-center">
                  <div
                    className="basic-weather-info container-fluid d-flex border-30 shadow-lg
                 border-dark-tr"
                  >
                    <div className="row w-100">
                      <div className="col col-sm-12 d-flex justify-content-center text-secondary">
                        <p className="display-0 m-0 text-shadow position-relative">
                          {formatTemperature(temp)}
                        </p>
                      </div>
                      <div className="col col-sm-12 d-flex justify-content-center text-secondary text-center align-items-center text-shadow-sm">
                        <p>{description}</p>
                      </div>

                      <div className="col col-sm-12 container-fluid text-light">
                        <div className="row align-items-center">
                          <div className="col col-sm-4 text-center">
                            <img src={WindyElement} alt="wind" /> Wind
                          </div>
                          <div className="col col-sm-4 text-center">|</div>
                          <div className="col col-sm-4 text-center">
                            {wind == null ? "--" : `${wind} km/h`}
                          </div>
                        </div>
                      </div>

                      <div className=" col col-sm-12 container-fluid text-light">
                        <div className="row align-items-center">
                          <div className="col col-sm-4 text-center">
                            <img src={HumidityElement} alt="wind" /> Hum
                          </div>
                          <div className="col col-sm-4 text-center">|</div>
                          <div className="col col-sm-4 text-center">
                            {humidity == null ? "--" : `${humidity}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* WEATHER INSIGHT SECTION */}
            <div className="col col-md-6 d-flex justify-content-center">
              <div className="row w-100 bg-image-1 border-30">
                <div className="col col-sm-12 d-flex justify-content-around">
                  {pastTimeline.map((entry) => {
                    const entryWeather = getWeatherMeta(entry.weatherCode);

                    return (
                      <div
                        key={entry.time}
                        className="border-30 mx-1 card-weather text-light d-flex flex-column justify-content-center align-items-center border-dark-tr"
                      >
                        <span className="py-0">
                          {formatTemperature(entry.temp)}
                        </span>
                        <img
                          src={entryWeather.icon}
                          alt={entryWeather.description}
                          className="p-0 img-fluid"
                        />
                        <span className="p-0">{formatHour(entry.time)}</span>
                      </div>
                    );
                  })}
                  {/* ACTIVE CARD-WEATHER 4 A.K.A CURRENT HOUR ZONE */}
                  <div className="border-30 mx-1 card-weather-active w-100 p-2 text-light d-flex flex-column justify-content-center align-items-center">
                    <span>{formatTemperature(temp)}</span>
                    <img src={icon} alt="cloudy" className="img-fluid" />
                    <span>
                      {formatHour(
                        currentTimeline?.time || currentWeather?.time,
                      )}
                    </span>
                  </div>
                  {futureTimeline.map((entry) => {
                    const entryWeather = getWeatherMeta(entry.weatherCode);

                    return (
                      <div
                        key={entry.time}
                        className="border-30 mx-1 card-weather text-light d-flex flex-column justify-content-center align-items-center border-dark-tr"
                      >
                        <span className="py-0">
                          {formatTemperature(entry.temp)}
                        </span>
                        <img
                          src={entryWeather.icon}
                          alt={entryWeather.description}
                          className="p-0 img-fluid"
                        />
                        <span className="p-0">{formatHour(entry.time)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="col col-sm-12 container-fluid text-light">
                  <div className="row justify-content-center">
                    <div className="col col-sm-10 weather-insight border-30 border-dark-tr mx-2">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col col-sm-12 dropdown-center">
                            <Dropdown>
                              <Dropdown.Toggle
                                className="location-box bg-light border-30 text-dark text-center p-2 w-100"
                                variant="success"
                                id="dropdown-basic"
                              >
                                <span className="h4">
                                  {activeLocationLabel}
                                </span>
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="d-column justify-content-center text-center dropdown-menu-dark w-100">
                                <Dropdown.Item
                                  onClick={() => setSelectedLocation("Current")}
                                >
                                  Current
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    setSelectedLocation("Manchester")
                                  }
                                >
                                  Manchester
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => setSelectedLocation("London")}
                                >
                                  London
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    setSelectedLocation("Birmingham")
                                  }
                                >
                                  Birmingham
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => setSelectedLocation("Bristol")}
                                >
                                  Bristol
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                        <div className="row p-0">
                          <div className="col col-sm-7 container-fluid">
                            <div className="row p-0">
                              <p>
                                Average Temperature:{" "}
                                {temp == null ? "--" : `${temp}°`}
                              </p>
                            </div>
                            <div className="row p-0">
                              <p>
                                Volumetric Water Content (VWC):{" "}
                                {vwc == null ? "--" : `${vwc}%`}
                              </p>
                            </div>
                            <div className="row p-0">
                              <p>Warnings/Alerts: {alertWarning}</p>
                            </div>
                            <div className="row p-0">
                              <p>Chance of Frosting: {frosting}</p>
                            </div>
                            <div className="row p-0">
                              <p>
                                Pest Infection Level:{" "}
                                {pestInfection == null
                                  ? "--"
                                  : `${pestInfection}%`}
                              </p>
                            </div>
                          </div>
                          <div className="col col-sm-1 d-flex justify-content-center p-0 p-0 m-0">
                            <div className="vr p-1 border-30 mb-4"></div>
                          </div>
                          <div className="col col-sm-4 d-flex justify-content-center align-items-center">
                            <div className="container-fluid p-0 ">
                              <div className="row w-100 pt-0">
                                <div className="col col-sm-12 d-flex justify-content-center">
                                  <img
                                    className="img-shadow"
                                    src={FlowerGood}
                                    alt="happy flower"
                                  />
                                </div>
                              </div>

                              <div className="row w-100 p-0">
                                <div className="col col-md-12 text-center">
                                  <p>Overall Percentage</p>
                                </div>
                                <div className="col col-md-12 d-flex align-items-center justify-content-center">
                                  <p className="text-secondary text-shadow h4">
                                    {overallPercentage}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row px-2 py-0">
        {/* LINKS SECTION */}
        <div className="col col-sm-12 bg-primary p-0 border-30">
          <div className="container-fluid">
            <div className="row justify-content-evenly">
              {/* LEARNING & RESOURCES LINK */}
              <Nav.Link
                as={Link}
                to="/resources-and-learning"
                className="col col-sm-7 bg-image-6 resources-and-learning border-30 d-flex align-items-end p-0 link-unstyled"
              >
                <div className="d-flex justify-content-center align-items-center w-100 p-5 link-section-text border-bottom-30">
                  <span>Learning & Resources</span>
                </div>
              </Nav.Link>
              {/* PREVIOUS HISTORY LINK */}
              <Nav.Link
                as={Link}
                to="/previous-history"
                className="col col-sm-4 bg-image-7 previous-history border-30 d-flex align-items-end p-0"
              >
                <div className="d-flex justify-content-center align-items-center w-100 p-5 link-section-text border-bottom-30">
                  <span>Previous History</span>
                </div>
              </Nav.Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row pb-2">
        <div className="col col-sm-12">
          <div className="home-copyright text-center">
            <p className="mb-0 text-dark">&copy; 2024 Daniil Zhelyazkov</p>
          </div>
        </div>
      </div>
    </>
  );
}
