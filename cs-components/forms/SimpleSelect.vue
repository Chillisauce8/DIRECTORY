<template>

<div class="simplae-select">
  <input class="chosen-value" type="text" value="" placeholder="Type to filter">
  <ul class="value-list">
    <li>Alabama</li>
    <li>Alaska</li>
    <li>Arizona</li>
    <li>Arkansas</li>
    <li>California</li>
    <li>Colorado</li>
    <li>Connecticut</li>
    <li>Delaware</li>
    <li>Florida</li>
    <li>Georgia</li>
    <li>Hawaii</li>
    <li>Idaho</li>
    <li>Illinois</li>
    <li>Indiana</li>
    <li>Iowa</li>
    <li>Kansas</li>
    <li>Kentucky</li>
    <li>Louisiana</li>
    <li>Maine</li>
    <li>Maryland</li>
    <li>Massachusetts</li>
    <li>Michigan</li>
    <li>Minnesota</li>
    <li>Mississippi</li>
    <li>Missouri</li>
    <li>Montana</li>
    <li>Nebraska</li>
    <li>Nevada</li>
    <li>New Hampshire</li>
    <li>New Jersey</li>
    <li>New Mexico</li>
    <li>New York</li>
    <li>North Carolina</li>
    <li>North Dakota</li>
    <li>Ohio</li>
    <li>Oklahoma</li>
    <li>Oregon</li>
    <li>Pennsylvania</li>
    <li>Rhode Island</li>
    <li>South Carolina</li>
    <li>South Dakota</li>
    <li>Tennessee</li>
    <li>Texas</li>
    <li>Utah</li>
    <li>Vermont</li>
    <li>Virginia</li>
    <li>Washington</li>
    <li>West Virginia</li>
    <li>Wisconsin</li>
    <li>Wyoming</li>
  </ul>
</div>

</template>

<script>
export default {
 mounted() {

const inputField = document.querySelector('.chosen-value');
const dropdown = document.querySelector('.value-list');
const dropdownArray = [... document.querySelectorAll('li')];
// console.log(typeof dropdownArray)
dropdown.classList.add('open');
inputField.focus(); // Demo purposes only
let valueArray = [];
dropdownArray.forEach(item => {
  valueArray.push(item.textContent);
});

const closeDropdown = () => {
  dropdown.classList.remove('open');
}

inputField.addEventListener('input', () => {
  dropdown.classList.add('open');
  let inputValue = inputField.value.toLowerCase();
  let valueSubstring;
  if (inputValue.length > 0) {
    for (let j = 0; j < valueArray.length; j++) {
      if (!(inputValue.substring(0, inputValue.length) === valueArray[j].substring(0, inputValue.length).toLowerCase())) {
        dropdownArray[j].classList.add('closed');
      } else {
        dropdownArray[j].classList.remove('closed');
      }
    }
  } else {
    for (let i = 0; i < dropdownArray.length; i++) {
      dropdownArray[i].classList.remove('closed');
    }
  }
});

dropdownArray.forEach(item => {
  item.addEventListener('click', (evt) => {
    inputField.value = item.textContent;
    dropdownArray.forEach(dropdown => {
      dropdown.classList.add('closed');
    });
  });
})

inputField.addEventListener('focus', () => {
   inputField.placeholder = 'Type to filter';
   dropdown.classList.add('open');
   dropdownArray.forEach(dropdown => {
     dropdown.classList.remove('closed');
   });
});

inputField.addEventListener('blur', () => {
   inputField.placeholder = 'Select state';
  dropdown.classList.remove('open');
});

document.addEventListener('click', (evt) => {
  const isDropdown = dropdown.contains(evt.target);
  const isInput = inputField.contains(evt.target);
  if (!isDropdown && !isInput) {
    dropdown.classList.remove('open');
  }
});
 }
}
</script>




<style lang="scss">



.chosen-value,
.value-list {
  position: absolute;
  bottom: 50;
  left: 0;
  width: 100%;
}

.chosen-value {
  font-family: 'Ek Mukta';
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 4px;
  height: 4rem;
  font-size: 1.1rem;
  padding: 1rem;
  background-color: #FAFCFD;
  border: 3px solid transparent;
  transition: .3s ease-in-out;
  
  &::-webkit-input-placeholder {
    color: #333;
  }
  
  &:hover {
    background-color: #FF908B;
    cursor: pointer;
    
    &::-webkit-input-placeholder {
      color: #333;
    }
  }
  
  &:focus,
  &.open {
    box-shadow: 0px 5px 8px 0px rgba(0,0,0,0.2);
    outline: 0;
    background-color: #FF908B;
    color: #000;
    
    &::-webkit-input-placeholder {
      color: #000;
    }
  }
}

.value-list {
  list-style: none;
  margin-top: 4rem;
  box-shadow: 0px 5px 8px 0px rgba(0,0,0,0.2);
  overflow: hidden;
  max-height: 0;
  transition: .3s ease-in-out;
  
  &.open {
   max-height: 320px;
   overflow: auto;
  }
  
  li {
    position: relative;
    height: 4rem;
    background-color: #FAFCFD;
    padding: 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background-color .3s;
    opacity: 1;
    
    &:hover {
      background-color: #FF908B;
    }
    
    &.closed {
      max-height: 0;
      overflow: hidden;
      padding: 0;
      opacity: 0;
    }
  }
}


</style>
