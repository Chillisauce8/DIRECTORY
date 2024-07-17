<script setup lang="ts"></script>

<template>
    <div class="form">
        <div class="field">
            <FloatLabel>
                <InputText id="text" v-model="value" />
                <label for="text">Username</label>
                <small class="message">Enter your username to reset your password.</small>
            </FloatLabel>
        </div>
        <div class="field">
            <FloatLabel>
                <InputText id="username" v-model="value" />
                <label for="username">Username</label>
                <div class="message">Enter your username to reset your password.</div>
                <div class="message">Enter your username to reset your password.</div>
                <div class="message">Enter your username to reset your password.</div>
            </FloatLabel>
        </div>
    </div>
</template>

<script setup lang="ts"></script>
<style lang="scss">
.form {
    font-size: 14px;
    .field,
    .field .p-float-label {
        display: flex;
        flex-direction: column;
        .message {
            font-size: 12px;
        }
    }
    .field .p-float-label label {
        top: 20px;
    }
}
</style>
