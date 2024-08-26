<template>
    <div class="design-test">
    <SectionWrapper title="Fonts">
<div class="font-list">
<div class="font-1">Here is some text that is great stag Do 1234567890 !@£$%&() - Ultra Light</div>
<div class="font-2">Here is some text that is great stag Do 1234567890 !@£$%&() - Thin</div>
<div class="font-3">Here is some text that is great stag Do 1234567890 !@£$%&() - Light</div>
<div class="font-4">Here is some text that is great stag Do 1234567890 !@£$%&() - Regular</div>
<div class="font-5">Here is some text that is great stag Do 1234567890 !@£$%&() - Medium</div>
<div class="font-6">Here is some text that is great stag Do 1234567890 !@£$%&() - Semi-Bold</div>
<div class="font-7">Here is some text that is great stag Do 1234567890 !@£$%&() - Bold</div>

<div>Different Face, Flex, Circular A, Circular B, Square, Triangle</div>
<div class="font-8">Here is some text that is great stag Do 1234567890 !@£$%&()</div>
<div class="font-9">Here is some text that is great stag Do 1234567890 !@£$%&()</div>
<div class="font-10">Here is some text that is great stag Do 1234567890 !@£$%&()</div>
<div class="font-11">Here is some text that is great stag Do 1234567890 !@£$%&()</div>
<div class="font-12">Here is some text that is great stag Do 1234567890 !@£$%&()</div>
</div>
</SectionWrapper>
<SectionWrapper title="Buttons">
    <ButtonMain>Unstyled</ButtonMain>
    <ButtonMain class="_2nd">2nd</ButtonMain>
    <ButtonMain class="outline">Unstyled + Outline</ButtonMain>
    <ButtonMain class="_2nd outline">2nd + Outline</ButtonMain>
    <ButtonMain class="_3rd">Unstyled 3rd</ButtonMain>
    <ButtonMain class="_3rd outline">3rd Outline</ButtonMain>
    <ButtonMain processing="true">Disabled</ButtonMain>
    <ButtonMain processing="true" class="_2rd outline">3rd Outline</ButtonMain>
    <ButtonMain processing="true"  class="_2nd">2nd</ButtonMain>
    <ButtonMain disabled="true">Disabled No Style</ButtonMain>
    <ButtonMain disabled="true" class="_2rd outline">Disabled 3rd Outline</ButtonMain>
    <ButtonMain disabled="true"  class="_2nd">Disabled 2nd</ButtonMain>

</SectionWrapper>
<SectionWrapper title="SVG Animation">
    <LazySvgIcon svg="squid" class="test draw"></LazySvgIcon>
</SectionWrapper>
<SectionWrapper title="SVG Animation">
    <SimpleSelect/>
</SectionWrapper>
<SectionWrapper title="SVG Animation">
    <LazySvgIcon svg="squid" class="test draw"></LazySvgIcon>
</SectionWrapper>
<SectionWrapper title="Button Select">
    <ButtonSelect />
</SectionWrapper>
<SectionWrapper title="Spicy Locked">
    <LockedCard />
</SectionWrapper>
<Courts />
</div>
</template>

<script>
export default {};
</script>

<style lang="scss">

.design-test{

.icon.test{
    width: 200px;
    height: 200px;
}

@keyframes draw-svg {
  from { 

    stroke-dashoffset: 100;
    stroke-dasharray: 100;
    }
  to {
    stroke-dashoffset: 0;
    stroke-dasharray:100;
}
}
.font-list{
    font-size: 24px;
    font-family: $ff2;
    text-align: center;
    letter-spacing: 5px;
    text-transform: uppercase;
    & .font-1{
        font-weight: 100;
    }
    & .font-2{
        font-weight: 200;
    }
    & .font-3{
        font-weight: 300;
    }
    & .font-4{
        font-weight: 400;
    }
    & .font-5{
        font-weight: 500;
    }
    & .font-6{
        font-weight: 600;
    }
    & .font-7{
        font-weight: 700;
    }
    & .font-8{
        font-weight: 400;
        font-family: $ff2;
    }
    & .font-9{
        font-weight: 400;
        font-family: $ff3;
    }
    & .font-10{
        font-weight: 400;
        font-family: $ff4;
    }
    & .font-11{
        font-weight: 400;
        font-family: $ff5;
    }
    & .font-12{
        font-weight: 400;
        font-family: $ff6;
    }

}
}
</style>
