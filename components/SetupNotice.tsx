import Link from 'next/link'

interface SetupNoticeProps {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}

export default function SetupNotice({
  title,
  description,
  actionHref,
  actionLabel,
}: SetupNoticeProps) {
  return (
    <div className="setup-notice">
      <span className="setup-notice-kicker">Setup required</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-outline">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
