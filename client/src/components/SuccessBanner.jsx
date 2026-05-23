import { Link } from 'react-router-dom'

export default function SuccessBanner({ wasCreated, label, editPath, listPath, listLabel }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      background:'linear-gradient(135deg,#2e7d32,#43a047)',
      borderRadius:12, padding:'14px 20px', marginBottom:24,
      boxShadow:'0 2px 12px rgba(46,125,50,.25)'
    }}>
      <span style={{width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
      <div style={{flex:1}}>
        <div style={{color:'#fff', fontWeight:700, fontSize:15}}>
          {label} {wasCreated ? 'Created' : 'Updated'} Successfully
        </div>
        <div style={{color:'rgba(255,255,255,.8)', fontSize:13}}>
          {wasCreated ? `The new ${label.toLowerCase()} has been saved to the database.` : `All changes have been saved to the database.`}
        </div>
      </div>
      <div style={{display:'flex', gap:10}}>
        {editPath && (
          <Link to={editPath} className="btn btn-sm" style={{background:'rgba(255,255,255,.2)',color:'#fff',border:'1px solid rgba(255,255,255,.4)'}}>
            Edit Again
          </Link>
        )}
        <Link to={listPath} className="btn btn-sm" style={{background:'#fff',color:'#2e7d32',fontWeight:600}}>
          {listLabel || 'Back to List'}
        </Link>
      </div>
    </div>
  )
}
