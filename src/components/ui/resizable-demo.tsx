import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
  
  import { Textarea } from "@/components/ui/textarea"

export function ResizableDemo() {
    return (
  
        <ResizablePanelGroup
          direction="horizontal"
          className="w-[70%] rounded-lg border"
        >
        <ResizablePanel defaultSize={1000}>
          <div className="flex h-[400px] items-center justify-center p-12">
            <span className="font-semibold">One</span>
            <Textarea />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={1000}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={500}>
              <div className="flex h-full items-center justify-center p-12">
                <span className="font-semibold">Two</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={1500}>
              <div className="flex h-full items-center justify-center p-12">
                <span className="font-semibold">Three</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }