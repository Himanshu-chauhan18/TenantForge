import { Building2, Network, ExternalLink } from 'lucide-react'

interface Division { id: number; code: string; name: string }
interface Props {
  divisions:     Division[]
  departments:   any[]
  divisionDepts: Record<string, number[]>
}

const DIV_COLORS = [
  '#0D9488','#7C3AED','#0284C7','#D97706','#E11D48',
  '#059669','#2563EB','#9333EA','#DC2626','#0891B2',
]
function divColor(id: number) { return DIV_COLORS[id % DIV_COLORS.length] }

function openChart(divisionId: number) {
  window.open(`/hrms/organization/hierarchy/chart?divisionId=${divisionId}`, '_blank')
}

export default function HierarchyIndexPage({ divisions }: Props) {
  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Organization Hierarchy</div>
          <div className="ph-sub">Select a division to open its interactive org chart in a new tab</div>
        </div>
      </div>

      <div className="card">
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Building2 size={14} style={{ color: 'var(--p)' }} />
          <span style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text1)' }}>Divisions</span>
          <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text4)' }}>
            {divisions.length} division{divisions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {divisions.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Network size={36} style={{ color: 'var(--text4)', margin: '0 auto 14px' }} />
            <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--text1)', marginBottom: 6 }}>No divisions yet</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text4)' }}>Create divisions first to view the org chart.</div>
          </div>
        ) : (
          <div>
            {divisions.map((div, i) => {
              const color = divColor(div.id)
              return (
                <div
                  key={div.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < divisions.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: color + '18', border: `1.5px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Building2 size={16} style={{ color }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {div.name}
                    </div>
                    <code style={{ fontSize: '.66rem', color: 'var(--text4)', background: 'var(--bg2)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
                      {div.code}
                    </code>
                  </div>

                  {/* Open Chart */}
                  <button
                    type="button"
                    onClick={() => openChart(div.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 8,
                      fontSize: '.76rem', fontWeight: 700,
                      color: color, background: color + '12',
                      border: `1.5px solid ${color}35`,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = color + '22' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = color + '12' }}
                  >
                    <ExternalLink size={12} /> Open Chart
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
