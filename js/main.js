import { getCurrentDate } from "./utils/date.js";

const clearAll = document.getElementById("clear-todos");
const currentDate = document.getElementById("current-date");
const list = document.getElementById("list");
const input = document.getElementById("add-todo");

// local storage
const storage = localStorage;

// classes
const classCheck = "fa-check-circle";
const classUncheck = "fa-circle";
const classLineThrough = "lineThrough";

// list to store todo & id
let listStorage = [];
let id = 0;

// drag & drop
let draggableItem;

// get date
currentDate.innerHTML = getCurrentDate();

// upload from storage on start
getFromStorage();

// event listeners
input.addEventListener("keydown", processAddedTodo);

list.addEventListener("click", processTodoInList);

clearAll.addEventListener("click", clearAllTodos);

// drag & drop todos

window.addEventListener("dragstart", (e) => {
  draggableItem = e.target;
  draggableItem.classList.add("dragged");
});

window.addEventListener("dragend", (e) => {
  draggableItem = e.target;
  draggableItem.classList.remove("dragged");
});

list.addEventListener("dragover", (e) => {
  e.preventDefault();
  const draggedElem = document.querySelector(".dragged");
  const draggedOverElem = getElemDraggedOver(list, e.clientY);
  if (draggedOverElem === null) {
    list.appendChild(draggedElem);
  } else {
    list.insertBefore(draggedElem, draggedOverElem);
  }
});

// functions

function processAddedTodo(e) {
  const toDo = input.value.trim();
  if (e.key === "Enter" && toDo !== "") {
    addTodo(toDo, id, false, false);
    input.focus();

    listStorage.push({
      text: toDo,
      id: id,
      done: false,
      trash: false,
    });

    saveToStorage();
    id++;
  }
}
// add todo
function addTodo(todo, id, done, trash) {
  if (trash) return;

  const DONE = done ? classCheck : classUncheck;
  const LINE = done ? classLineThrough : "";

  const position = "beforeend";
  const item = `
  <li class="item" draggable="true">
    <i class="far ${DONE} circle" data-status="complete" id="${id}"></i>
    <p class="${LINE}" id="text">${todo}</p>
    <i class="fas fa-trash-alt trash" data-status="delete"  id="${id}"></i>
    </li>
    `;

  list.insertAdjacentHTML(position, item);
  input.value = "";
}

// complete todo
function completeTodo(element) {
  element.classList.toggle(classUncheck);
  element.classList.toggle(classCheck);
  element.parentNode.querySelector("#text").classList.toggle(classLineThrough);

  listStorage[element.id].done = listStorage[element.id].done ? false : true;
}

function removeTodo(element) {
  element.parentNode.parentNode.removeChild(element.parentNode);
  listStorage[element.id].trash = true;
}

function clearAllTodos() {
  storage.clear();
  location.reload();
}

// local storage
function saveToStorage() {
  storage.setItem("TODO", JSON.stringify(listStorage));
}

function getFromStorage() {
  const data = storage.getItem("TODO");
  if (data) {
    listStorage = JSON.parse(data);
    id = listStorage.length; //set id to the last one in in the list
    loadList(listStorage); //load to UI
  } else {
    listStorage = [];
    id = 0;
  }
}

function loadList(array) {
  array.forEach((item) => {
    addTodo(item.text, item.id, item.done, item.trash);
  });
}

function processTodoInList(e) {
  let element = e.target;

  let status = element.dataset.status;
  switch (status) {
    case "complete":
      completeTodo(element);
      break;
    case "delete":
      removeTodo(element);
      break;

    default:
      break;
  }
  saveToStorage();
}

function getElemDraggedOver(container, mousePosition) {
  // determine all elements inside container we are hovering over
  const itemsInside = [...container.querySelectorAll(".item:not(.dragged)")];
  // loop through elems to determine which elem mousePosition is over
  return itemsInside.reduce(
    (closestElem, containerChild) => {
      const box = containerChild.getBoundingClientRect();

      // distance from top to mouse cursor inside containerChild
      // from vport top - till box top - half box height
      const offset = mousePosition - box.top - box.height / 2;
      // when below elem: positive; above: negative
      // console.log("offset", offset);
      if (offset < 0 && offset > closestElem.offset) {
        return {
          offset: offset,
          child: containerChild,
        };
      } else {
        return closestElem;
      }
      // which elem directly after mouse cursor
      // get offset Y to container for closest and the one directly below
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).child;
}
