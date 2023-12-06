<template>
    <button class="chip-button" :class="{ active: data.active }" @click="filter">{{ data.label }}</button>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"

interface Button {
    label: String
    active: boolean
}
interface Props {
    data: Button
    idx: number
}

const props = defineProps<Props>()
const { data, idx } = toRefs(props)

const emit = defineEmits(["send-event"])
const filter = () => {
    const item = {
        buttonData: data.value,
        selectedButtonIdx: idx.value,
    }
    emit("send-event", item)
}
</script>

<style lang="scss" scoped>
.chip-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 80px;
    height: 40px;

    outline: none;
    border: none;

    font-family: "Public Sans", sans-serif;
    font-weight: 600;
    font-size: 16px;

    border-radius: 8px;
    background-color: $color-blue-400;
    color: $color-white-000;

    cursor: pointer;

    &:hover {
        background-color: $color-blue-700;
    }
    &.active {
        background-color: $color-blue-700;
    }
}
</style>
