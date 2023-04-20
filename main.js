require('dotenv').config()

const {InfluxDB, Point} = require('@influxdata/influxdb-client')
const influxToken = process.env.INFLUX_TOKEN
const influxURL = process.env.INFLUX_URL
const influxOrg = `BMS`
const influxBucket = `bms`

const client = new InfluxDB({url: influxURL, token: influxToken})

const startInterval = 70;
const userID = process.env.URAD_USER_ID
const userHash = process.env.URAD_USER_HASH
const sensorID = process.env.URAD_SENSOR_ID


const fetcher = () => fetch(`https://data.uradmonitor.com/api/v1/devices/${sensorID}/all/${startInterval}`, {
    method: "GET",
    headers: {"X-User-id": userID, "X-User-hash": userHash}
}).then((res) => {
    res.json().then((data) => {

        console.log(data);
        console.log(data[0].time)

        let writeClient = client.getWriteApi(influxOrg, influxBucket, 'ns')

            let point = new Point('general_measurement')
                .floatField('temperature', data[0].temperature)
                .intField('pressure', data[0].pressure)
                .floatField('humidity', data[0].humidity)
                .intField('voc', data[0].voc)
                .intField('noise', data[0].noise)

            let particles_point = new Point('particles_measurement')
                .intField('co2', data[0].co2)
                .intField('ch2o', data[0].ch2o)
                .intField('o3', data[0].o3)
                .intField('pm1', data[0].pm1)
                .intField('pm25', data[0].pm25)
                .intField('pm10', data[0].pm10)



                writeClient.writePoint(point)
                writeClient.writePoint(particles_point)


                writeClient.flush()

    })
})

/**
 * Interval is currently set at 20 seconds for testing purposes
 */
setInterval(fetcher, 20000);

