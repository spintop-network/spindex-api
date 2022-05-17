const express = require("express");

export const getData = () => {
  fetch("./data.json")
    .then((response) => {
      return response.json();
    })
    .then((jsondata) => console.log(jsondata));
};
