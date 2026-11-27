import { type ReactNode, useEffect, useRef } from "react"

export function Dialog({
  id,
  title,
  children,
  onDismiss,
}: {
  id: string
  title: string
  children: ReactNode
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])
  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={id + "-title"}
      onCancel={onDismiss}
    >
      <h2 id={id + "-title"}>{title}</h2>
      {children}
    </dialog>
  )
}
