import { TrackModel } from "../model";

export const getParamValues = (url: string) => {
  return url
    .slice(1)
    .split("&")
    .reduce((prev: any, curr: any) => {
      const [title, value] = curr.split("=");
      prev[title] = value;
      return prev;
    }, {});
};

export const getRandom = (arr: TrackModel[], n: number) => {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

export const fancyTimeFormat = (duration: number) => {
  var minutes = Math.floor(duration / 60000);
  var seconds = ((duration % 60000) / 1000).toFixed(0);
  return minutes + ":" + (parseInt(seconds) < 10 ? "0" : "") + seconds;
};
