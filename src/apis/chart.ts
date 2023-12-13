import axios from "axios"
import dayjs from "dayjs"

const API_KEY = "tHplpaJY4djavBSp3JNsRxobTvP97eym"
const today = dayjs().format("YYYY-MM-DD")

export default {
    async getStock(ticker: string, timeSpan: string) {
        // ticker: string, timeSpan: string, startDate: string, endDate: string
        const res = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/${timeSpan}/2023-01-01/${today}?adjusted=true&sort=asc&limit=365&apiKey=${API_KEY}`)

        return res
    },
}
