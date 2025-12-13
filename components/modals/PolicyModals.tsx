interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RefundModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-800"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900">Refund policy</h2>
        <hr className="mb-4" />
        <p className="text-gray-700 text-base leading-relaxed">
          There is no option of refund after purchase.
        </p>
      </div>
    </div>
  )
}

export function PrivacyModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null

  const policies = [
    {
      title: 'Data Collection',
      content:
        'We collect basic details (name, email, phone number) only for registration and communication purposes.',
    },
    {
      title: 'Data Usage',
      content:
        'Your information will be used strictly to provide services, updates, and reminders related to Virtual Library. We do not sell or share your personal data with third parties.',
    },
    {
      title: 'Data Protection',
      content:
        'Groups are monitored to maintain a safe and respectful environment. Sensitive information shared in groups is community-based and voluntary.',
    },
    {
      title: 'Communication',
      content:
        'By registering, you agree to receive service-related messages via WhatsApp, Telegram, or email.',
    },
    {
      title: 'Opt-Out',
      content:
        'You may leave groups or unsubscribe from communication at any time by notifying us.',
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacy policy</h2>

        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          {policies.map((policy, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-1">{policy.title}</h3>
              <p>{policy.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

