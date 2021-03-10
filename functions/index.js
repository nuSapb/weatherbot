const functions = require("firebase-functions");
const request = require("request-promise");

const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const AQI_API_KEY = "XXX";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer YYY`,
};

exports.LineBotReply = functions
  .region("asia-east2")
  .https.onRequest((req, res) => {
    if (req.body.events[0].message.type === "location") {
      let replyToken = req.body.events[0].replyToken;
      let latitude = req.body.events[0].message.latitude;
      let longitude = req.body.events[0].message.longitude;

      return request({
        method: `GET`,
        uri: `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${AQI_API_KEY}`,
        json: true,
      }).then((response) => {
        const city = response.data.city;
        const AQI = response.data.current.pollution.aqius;
        const temperature = response.data.current.weather.tp;
        const weatherIcon = response.data.current.weather.ic;

        const level;
        const bgColor;
        const textColor;
        const maskUrl;
        const weatherIconUrl;

        switch (weatherIcon) {
          case "01d":
            weatherIconUrl = "https://airvisual.com/images/01d.png";
            break;
          case "01n":
            weatherIconUrl = "https://airvisual.com/images/01n.png";
            break;
          case "02d":
            weatherIconUrl = "https://airvisual.com/images/02d.png";
            break;
          case "02n":
            weatherIconUrl = "https://airvisual.com/images/02n.png";
            break;
          case "03d":
            weatherIconUrl = "https://airvisual.com/images/03d.png";
            break;
          case "04d":
            weatherIconUrl = "https://airvisual.com/images/04d.png";
            break;
          case "09d":
            weatherIconUrl = "https://airvisual.com/images/09d.png";
            break;
          case "10d":
            weatherIconUrl = "https://airvisual.com/images/10d.png";
            break;
          case "10n":
            weatherIconUrl = "https://airvisual.com/images/10n.png";
            break;
          case "11d":
            weatherIconUrl = "https://airvisual.com/images/11d.png";
            break;
          case "13d":
            weatherIconUrl = "https://airvisual.com/images/13d.png";
            break;
          case "50d":
            weatherIconUrl = "https://airvisual.com/images/50d.png";
        }

        if (AQI < 50) {
          level = "Good";
          bgColor = "#a8e05f";
          textColor = "#718b3A";
          maskUrl = "https://source.unsplash.com/4lxGhjmDYG8/1600x900";
        } else if (AQI < 100) {
          level = "Moderate";
          bgColor = "#fdd74b";
          textColor = "#a57f23";
          maskUrl = "https://source.unsplash.com/4lxGhjmDYG8/1600x900";
        } else if (AQI < 150) {
          level = "Unhealthy for Sensitive Groups";
          bgColor = "#fe9b57";
          textColor = "#b25826";
          maskUrl = "https://source.unsplash.com/4lxGhjmDYG8/1600x900";
        } else if (AQI < 200) {
          level = "Unhealthy";
          bgColor = "#fe6a69";
          textColor = "#af2c3b";
          maskUrl = "https://source.unsplash.com/4lxGhjmDYG8/1600x900";
        } else if (AQI < 300) {
          level = "Very Unhealthy";
          bgColor = "#a97abc";
          textColor = "#634675";
          maskUrl = "https://source.unsplash.com/4lxGhjmDYG8/1600x900";
        } else {
          level = "Hazardous";
          bgColor = "#a87383";
          textColor = "#683e51";
          maskUrl = "https://source.unsplash.com/4lxGhjmDYG8/1600x900";
        }

        //Set contens for flex message
        const message = {
          type: "bubble",
          header: {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: city,
                color: "#414141",
                gravity: "center",
                size: "xl",
                wrap: true,
                flex: 3,
              },
              {
                type: "image",
                url: weatherIconUrl,
                size: "xs",
                flex: 1,
              },
              {
                type: "text",
                text: `${temperature} °C`,
                color: "#414141",
                size: "lg",
                align: "end",
                gravity: "center",
                flex: 1,
              },
            ],
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "image",
                    url: maskUrl,
                    size: "md",
                    align: "start",
                  },
                  {
                    type: "text",
                    text: level,
                    wrap: true,
                    size: "lg",
                    color: textColor,
                    gravity: "center",
                  },
                ],
                margin: "xxl",
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: `${AQI}`,
                    color: textColor,
                    size: "5xl",
                    align: "center",
                  },
                  {
                    type: "text",
                    text: "US AQI",
                    color: textColor,
                    size: "xs",
                    margin: "sm",
                  },
                ],
              },
            ],
          },
          styles: {
            body: {
              backgroundColor: bgColor,
            },
          },
        };

        return request({
          method: `POST`,
          uri: `${LINE_MESSAGING_API}/reply`,
          headers: LINE_HEADER,
          body: JSON.stringify({
            replyToken: replyToken,
            messages: [
              {
                type: "flex",
                altText: "AQI Report",
                contents: message,
              },
            ],
          }),
        });
      });
    }
  });
