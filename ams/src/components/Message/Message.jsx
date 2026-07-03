import './Message.css'

function Message({ text }) {
  if (!text) {
    return null
  }

  return <p className="message">{text}</p>
}

export default Message
