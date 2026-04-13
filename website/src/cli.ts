import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "./styles.css";
import readme from "../../cli/README.md?raw";

const target = document.getElementById("readme")!;
target.innerHTML = marked.parse(readme) as string;
hljs.highlightAll();
