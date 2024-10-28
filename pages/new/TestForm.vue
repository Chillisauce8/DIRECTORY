<script setup lang="ts"></script>

<template>
  <div class="card">
    <DataItem function="create" collection="test_form"
        title='Test Form Title'
        subtitle='This is where a subtitle would go which could explain a little bit more about the form below'>
    </DataItem>

<!--    <div class="card">-->
<!--        <DataItem function="read" id="66683710ec39a4c35261a9a6" collection="events" :fields="{ name: 1, startDate: 1, endDate: 1 }" v-slot="{ item }">-->
<!--            <span>{{ JSON.stringify(item) }}</span>-->
<!--        </DataItem>-->

<!--        <br /><br />-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;<br /><br />-->

<!--        <DataItem function="read" collection="events" :fields="{ name: 1, startDate: 1 }" v-slot="{ items }">-->
<!--            <ul>-->
<!--                <li v-for="item in items">Name: {{ item.name }} | StartDate: {{ item.startDate }}</li>-->
<!--            </ul>-->
<!--        </DataItem>-->

<!--        <br /><br />-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;<br /><br />-->

<!--        <DataItem function="read" collection="events" :find="{ name: 'test' }" :fields="{ name: 1, startDate: 1 }" v-slot="{ items }">-->
<!--            <ul>-->
<!--                <li v-for="item in items">Name: {{ item.name }} | StartDate: {{ item.startDate }}</li>-->
<!--            </ul>-->
<!--        </DataItem>-->
<!--    </div>-->
  </div>
</template>

<script setup lang="ts"></script>
