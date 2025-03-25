"use client"
import {  Button, Group, Card, Center, Container, Title, Text, MantineProvider } from "@mantine/core";
import './App.css'
import { useState } from "react";


function App() {
  const [copied, setCopied] = useState(false);

  const getANSIColor = (ansi: string): string => {
    const ansiColors: { [key: string]: string } = {
        "30": "#4f545c",  // Dark Gray
        "31": "#dc322f",  // Red
        "32": "#859900",  // Green
        "33": "#b58900",  // Gold
        "34": "#268bd2",  // Light Blue
        "35": "#d33682",  // Pink
        "36": "#2aa198",  // Teal
        "37": "#ffffff",  // White
        "40": "#002b36",  // Blueish Black (BG)
        "41": "#cb4b16",  // Rust Brown (BG)
        "42": "#586e75",  // Gray 40% (BG)
        "43": "#657b83",  // Gray 45% (BG)
        "44": "#839496",  // Light Gray 55% (BG)
        "45": "#6c71c4",  // Blurple (BG)
        "46": "#93a1a1",  // Light Gray 60% (BG)
        "47": "#fdf6e3",  // Cream White (BG)
    };

    return ansiColors[ansi] || "#ffffff"; // Default to white
};

const handleReset = () => {
  const textarea = document.querySelector("#textarea") as HTMLDivElement;
  if (!textarea) return;

  // Get all <span> elements inside the textarea
  const spans = textarea.querySelectorAll("span");

  spans.forEach((span) => {
      // Replace span with its plain text content
      const textNode = document.createTextNode(span.innerText);
      span.replaceWith(textNode);
  });

  // Normalize the text to clean up extra nodes
  textarea.normalize();
};


  const handleDelete = () => {
    const textarea = document.querySelector("#textarea") as HTMLDivElement;
    if (!textarea) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
};

  const handleClick = (ansi: string) => {
    const textarea = document.querySelector("#textarea") as HTMLDivElement;
    if (!textarea) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    if (!selectedText) return;

    // Create a new span with the selected text
    const span = document.createElement("span");
    span.innerText = selectedText;
    span.classList.add(`ansi-${ansi}`);

    // Apply styles based on ANSI code
    if (ansi === "1") span.style.fontWeight = "bold";         // Bold
    if (ansi === "4") span.style.textDecoration = "underline"; // Underline

    // Foreground colors (30-37)
    if (parseInt(ansi) >= 30 && parseInt(ansi) < 40) {
        const fgColor = getANSIColor(ansi); // Function to get FG color
        span.style.color = fgColor;
    }

    // Background colors (40-47)
    if (parseInt(ansi) >= 40 && parseInt(ansi) < 50) {
        const bgColor = getANSIColor(ansi); // Function to get BG color
        span.style.backgroundColor = bgColor;
    }

    // Replace selected text with formatted span
    range.deleteContents();
    range.insertNode(span);

    // Ensure span stays inside the textarea
    textarea.normalize();

    // Maintain selection after formatting
    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);

    // Update state
    // setText(textarea.innerHTML);
};

  const convertToANSI = (nodes: NodeListOf<ChildNode> | ChildNode[], states: any[]): string => {
    let text = "";
    for (const node of nodes) {
        if (node.nodeType === 3) {
            text += node.textContent;
            continue;
        }
        if (node.nodeName === "BR") {
            text += "\n";
            continue;
        }

        const span = node as HTMLSpanElement;
        const ansiCode = +(span.className.split("-")[1]);
        const newState = { ...states[states.length - 1] };

        if (ansiCode < 30) newState.st = ansiCode;
        if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
        if (ansiCode >= 40) newState.bg = ansiCode;

        states.push(newState);
        text += `\x1b[${newState.st || 0};${newState.fg || 39};${newState.bg || 49}m`;
        text += convertToANSI(span.childNodes, states);
        states.pop();
        text += `\x1b[0m`;
    }
    return text;
};

const handleCopy = async () => {
  const textarea = document.querySelector("#textarea");
  if (!textarea) return;

  const toCopy = "```ansi\n" + convertToANSI(textarea.childNodes, [{ fg: 39, bg: 49, st: 0 }]) + "\n```";

  try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  } catch (err) {
      alert("Failed to copy text!");
  }
};


  return (
    <>
    <MantineProvider>
       <Container size="lg" style={{ background: "#36393F", color: "#FFF", minHeight: "100vh", padding: "20px" }}>
        <Center style={{ padding: "10px", background: "#2F3136", color: "#FFF" }}>
              <Title order={3}>Discord Text Styler</Title>
        </Center>
      <Title order={2}  style={{ marginBottom: "20px" }}>
        Discord <span style={{ color: "#5865F2" }}>Colored</span> Text Generator
      </Title>
      <Text >
        Write your text, select parts of it, and apply colors to generate ANSI-styled Discord messages.
      </Text>
      <Card   shadow="sm" padding="lg" radius="md" style={{ background: "#2F3136", color: "#FFF" }}>
        <div
          id="textarea"
          contentEditable
          suppressContentEditableWarning
          style={{
            fontFamily: "monospace",
            background: "#202225",
            color: "#B9BBBE",
            padding: "10px",
            minHeight: "100px",
            border: "1px solid #5865F2"
          }}
          // onInput={(e) => setText((e.target as HTMLDivElement).innerHTML)}
      ></div>
        <Group  mt="md">
        <div className="text-white text-center space-y-4">
      {/* Action Buttons */}
      <div className="space-x-2">
        <button
          data-ansi="0"
          className="button bg-[#4f545c] hover:bg-[#6b7280]"
          onClick={() => handleReset()}
        >
          Reset All
        </button>
        <button
          data-ansi="0"
          className="button bg-[#4f545c] hover:bg-[#6b7280]"
          onClick={() => handleDelete()}
        >
          Delete
        </button>
        <button
          data-ansi="1"
          className="button bg-[#4f545c] hover:bg-[#6b7280] font-bold"
          onClick={() => handleClick("1")}
        >
          Bold
        </button>
        <button
          data-ansi="4"
          className="button bg-[#4f545c] hover:bg-[#6b7280] font-light underline"
          onClick={() => handleClick("4")}
        >
          Line
        </button>
      </div>

      {/* Foreground Colors */}
      <div className="space-y-2">
        <strong>FG</strong>
        <div className="flex space-x-2 justify-center">
          {[
            { ansi: "30", color: "#4f545c" },
            { ansi: "31", color: "#dc322f" },
            { ansi: "32", color: "#859900" },
            { ansi: "33", color: "#b58900" },
            { ansi: "34", color: "#268bd2" },
            { ansi: "35", color: "#d33682" },
            { ansi: "36", color: "#2aa198" },
            { ansi: "37", color: "#ffffff" },
          ].map(({ ansi, color }) => (
            <button
              key={ansi}
              data-ansi={ansi}
              className="w-8 h-15 style-button"
              style={{ backgroundColor: color }}
              onClick={() => handleClick(ansi)}
            />
          ))}
        </div>
      </div>

      {/* Background Colors */}
      <div className="space-y-2">
        <strong>BG</strong>
        <div className="flex space-x-2 justify-center">
          {[
            { ansi: "40", color: "#002b36" },
            { ansi: "41", color: "#cb4b16" },
            { ansi: "42", color: "#586e75" },
            { ansi: "43", color: "#657b83" },
            { ansi: "44", color: "#839496" },
            { ansi: "45", color: "#6c71c4" },
            { ansi: "46", color: "#93a1a1" },
            { ansi: "47", color: "#fdf6e3" },
          ].map(({ ansi, color }) => (
            <button
              key={ansi}
              data-ansi={ansi}
              className="w-8 h-8 rounded style-button" 
              style={{ backgroundColor: color }}
              onClick={() => handleClick(ansi)}
            />
          ))}
        </div>
      </div>
    </div>
        </Group>
        <Button className="button copy" onClick={handleCopy} style={{ backgroundColor: copied ? "#3BA55D" : "#5865F2" }}>
        {copied ? "Copied!" : "Copy to Clipboard"}
       </Button>
      </Card>
        <Center style={{ padding: "10px", background: "#2F3136", color: "#FFF" }}>
        <Text size="sm">Made with 💙 for VideoDubber Assignment</Text>
        </Center>
    </Container>
    </MantineProvider>
    </>
  )
}

export default App
