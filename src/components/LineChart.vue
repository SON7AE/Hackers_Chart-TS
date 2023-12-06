<template>
    <div class="lineChart">
        <div class="container">
            <div class="container__search-box">
                <div class="container__search-box__search">
                    <img src="@assets/icons/search.svg" alt="" />
                    <input v-model="symbolTicker" type="text" placeholder="티커를 검색하세요." class="input" @keydown.enter="submit" />
                </div>
                <button class="container__search-box__button" @click.change="submit">검색</button>
            </div>
            <span class="container__symbol"> 검색한 티커 : {{ symbolTicker }}</span>
            <div class="container__chip-box" :class="{ loading: isLoading }">
                <ChipButton v-for="(item, index) in buttons" :key="item.label" :data="item" :idx="index" @send-event="filteredData" />
            </div>
            <div class="container__chart-box" :class="{ loading: isLoading }">
                <canvas id="myChart" style="max-width: 100%; max-height: 500px"></canvas>
            </div>
            <div v-if="isLoading" class="container__skeleton"></div>
        </div>
        <div v-if="isLoading" role="status" class="spinner">
            <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                />
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import ChipButton from "./ChipButton.vue"
import { ref, onMounted } from "vue"
import Chart, { ChartConfiguration, ChartItem } from "chart.js/auto"
import api from "@apis/chart"
import dayjs from "dayjs"

const isLoading = ref<boolean>(false)
const symbolTicker = ref<string>("")
const buttons = ref<any>([
    {
        label: "1달",
        active: false,
    },
    {
        label: "1년",
        active: true,
    },
])
const labels = ref<string[]>(["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"])

const graphData = ref<Number[]>([])
const chartData = ref<any>({
    labels: labels,
    datasets: [
        {
            label: symbolTicker.value,
            data: [],
            borderColor: "#32D583",
            backgroundColor: "rgba(50, 213, 131, 0.16)",
            tension: 0.1,
            fill: true,
        },
    ],
})
const config: ChartConfiguration = {
    type: "line",
    data: chartData.value,
    options: {
        plugins: {
            // Label 지우는 속성
            legend: {
                display: false,
            },
            subtitle: {
                display: true,
                text: symbolTicker.value,
                padding: 12,
            },
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    tickBorderDash: [0, 10],
                },
            },
            y: {
                type: "linear",
                grace: "100%",
                grid: {
                    display: true,
                    tickBorderDash: [0, 10],
                },
            },
        },
    },
}

function createChart() {
    const ctx = <ChartItem>document.getElementById("myChart")
    const chartWithKey = Chart.getChart("myChart")
    if (chartWithKey !== undefined) {
        chartWithKey.destroy()
    }
    new Chart(ctx, config)
}
async function getData(stockSymbol: string, timeSpan: string) {
    let stockTicker = ""
    let period = ""

    if (stockSymbol === "") stockTicker = "AAPL"
    else if (stockSymbol !== "") stockTicker = stockSymbol

    if (timeSpan === "") period = "month"
    else if (timeSpan !== "") period = timeSpan

    try {
        await api.getStock(stockTicker, period).then((res: any) => {
            graphData.value = res.data.results.map((item: any) => {
                return item.o
            })
            chartData.value.datasets[0].data = graphData.value
        })
    } catch (error) {
        console.log(error)
    }
}

function submit() {
    labels.value = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
    buttons.value.forEach((item: any) => {
        item.active = false
    })
    buttons.value[1].active = true

    isLoading.value = true
    getData(symbolTicker.value, "")
    setTimeout(() => {
        createChart()
        isLoading.value = false
    }, 2000)
}
function filteredData(data: any) {
    buttons.value.forEach((item: any) => {
        item.active = false
    })
    buttons.value[data.selectedButtonIdx].active = true

    if (data.buttonData.label === "1달") {
        // 라벨 30일 출력
        let newLabel: string[] = []
        for (let i = 0; i < 30; i++) {
            // dayjs에서 subtract 메서드는 두 번째 인자를 기준으로 첫 번째 인자만큼 날짜를 빼준다.
            newLabel.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"))
        }
        labels.value = [...newLabel].reverse()
        // 30일 기간동안의 데이터만 출력
        isLoading.value = true
        getData(symbolTicker.value, "day")
            .then(() => {
                setTimeout(() => {
                    createChart()
                    isLoading.value = false
                }, 2000)
            })
            .then(() => {
                // 임의로 30개 자름
                chartData.value.datasets[0].data = graphData.value.slice(graphData.value.length - 31, graphData.value.length - 1)
            })
    } else if (data.buttonData.label === "1년") {
        labels.value = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

        getData(symbolTicker.value, "month")
        isLoading.value = true
        setTimeout(() => {
            createChart()
            isLoading.value = false
        }, 2000)
    }
}

onMounted(() => {
    // 초기세팅
    getData("", "")
    isLoading.value = true
    setTimeout(() => {
        createChart()
        isLoading.value = false
    }, 2000)
    symbolTicker.value = "AAPL"
})
</script>

<style lang="scss" scoped>
.lineChart {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100vh;

    padding: 40px;

    .container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        width: 100%;

        &__search-box {
            display: flex;
            align-items: center;

            gap: 16px;

            &__search {
                display: flex;
                align-items: center;
                justify-content: flex-start;

                width: 360px;

                padding: 14px;
                gap: 16px;

                border-radius: 8px;
                border: 1px solid $color-gray-300;
                background-color: $color-white-000;
                box-shadow: 0px 2px 8px 0px rgba(228, 231, 236, 0.7);

                &:focus-within {
                    border-radius: 8px;
                    border: 1px solid var(--blue-500, #2e90fa);
                    background: $color-white-000;
                    box-shadow: 0px 0px 8px 0px rgba(21, 112, 239, 0.3);

                    .input {
                        color: $color-gray-800;
                    }
                }
                .input {
                    outline: none;
                    border: none;

                    width: 320px;

                    font-size: 17px;
                    font-weight: 500;
                    line-height: 17px;

                    color: $color-gray-500;
                }
            }
            &__button {
                display: flex;
                align-items: center;
                justify-content: center;

                padding: 15px 24px;

                background-color: $color-pupple-750;
                color: $color-white-000;

                font-family: "Public Sans", sans-serif;
                font-weight: 600;
                font-size: 16px;

                border-radius: 8px;

                outline: none;
                border: none;
                cursor: pointer;
            }
        }
        &__symbol {
            margin: 16px 16px 16px 0;

            font-family: "Public Sans", sans-serif;
            font-weight: 500;
            font-size: 24px;
        }
        &__chip-box {
            display: flex;
            align-items: center;
            justify-content: flex-start;

            gap: 4px;
            margin-top: 24px;
        }
        &__chart-box {
            &.loading {
                display: none;
            }
        }
        &__skeleton {
            width: 100%;
            height: 468px;

            margin-top: 32px;

            background-color: $color-gray-100;
            border-radius: 10px;
        }
    }
    .spinner {
        position: absolute;

        top: 50%;
        left: 50%;

        transform: translate(-50%, 50%);
    }
}
</style>
