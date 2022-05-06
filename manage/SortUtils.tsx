import React from 'react';

export default class SortUtils extends React.Component{
    static sortTypes=  {
        up: {
          class: "sort-up",
          fn: (a, b) => a.score - b.score,
        },
        down: {
          class: "sort-down",
          fn: (a, b) => b.score - a.score,
        },
        default: {
          class: "sort",
          fn: (a, b) => a,
        }
    };
}