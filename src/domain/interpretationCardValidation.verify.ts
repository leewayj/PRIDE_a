/**
 * interpretationCardValidation.ts에 대한 샘플 문장 목데이터 기반 동작 확인 스크립트.
 * 테스트 러너 없이 `node src/domain/interpretationCardValidation.verify.ts`로 직접 실행한다.
 */
import {
  detectAbsoluteEvaluationExpressions,
  detectMedicalJudgmentExpressions,
  detectUnmeasuredItemExpressions,
  validateInterpretationCardText,
} from './interpretationCardValidation.ts'

let passedCount = 0

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  const matches = JSON.stringify(actual) === JSON.stringify(expected)
  if (!matches) {
    throw new Error(
      `FAIL: ${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    )
  }
  passedCount += 1
  console.log(`PASS: ${message}`)
}

// --- 통과 케이스 (금지 표현 없음) -------------------------------------------

const passingSentences = [
  '이번 분석 구간에서 턱선 각도가 완만하게 달라졌어요.',
  '최근 8주간 관리 마커가 2건 등록되었습니다.',
  '오늘 촬영한 사진은 판정 기준을 통과했어요.',
]

passingSentences.forEach((sentence) => {
  const result = validateInterpretationCardText(sentence)
  assertEqual(result.hasForbiddenExpression, false, `통과 문장은 금지 표현이 감지되지 않는다: "${sentence}"`)
  assertEqual(result.needsRetry, false, `통과 문장은 재시도가 필요하지 않다: "${sentence}"`)
  assertEqual(result.matches, [], `통과 문장은 매치가 비어있다: "${sentence}"`)
})

// --- 실패 케이스 1: 절대 평가 표현 ------------------------------------------

{
  const result = validateInterpretationCardText('당신의 피부 나이는 32세로 추정됩니다.')
  assertEqual(
    detectAbsoluteEvaluationExpressions('당신의 피부 나이는 32세로 추정됩니다.'),
    ['피부 나이'],
    '"피부 나이" 표현이 감지된다',
  )
  assertEqual(result.needsRetry, true, '절대 평가 표현이 있으면 재시도가 필요하다')
  assertEqual(result.matches, [{ category: 'absolute-evaluation', expression: '피부 나이' }], '카테고리가 absolute-evaluation으로 기록된다')
}

{
  const detected = detectAbsoluteEvaluationExpressions('노화점수가 지난달보다 낮아졌습니다.')
  assertEqual(detected, ['노화 점수'], '공백이 없어도("노화점수") "노화 점수" 표현이 감지된다')
}

// --- 실패 케이스 2: 미측정 항목 언급 ----------------------------------------

{
  const detected = detectUnmeasuredItemExpressions('모공이 눈에 띄게 좁아진 것으로 보여요.')
  assertEqual(detected, ['모공'], '"모공" 언급이 감지된다')
}

{
  const detected = detectUnmeasuredItemExpressions('색소와 주름이 함께 옅어졌습니다.')
  assertEqual(detected, ['색소', '주름'], '한 문장에 있는 미측정 항목 2개가 모두 감지된다')
}

{
  const result = validateInterpretationCardText('피부 탄력이 개선된 경향이 있습니다.')
  assertEqual(result.needsRetry, true, '미측정 항목 언급이 있으면 재시도가 필요하다')
  assertEqual(result.matches, [{ category: 'unmeasured-item', expression: '탄력' }], '카테고리가 unmeasured-item으로 기록된다')
}

// --- 실패 케이스 3: 의료적 판단 표현 ----------------------------------------

{
  const detected = detectMedicalJudgmentExpressions('이 변화는 시술의 치료 효과로 진단됩니다.')
  assertEqual(detected, ['진단', '치료'], '"진단"과 "치료"가 모두 감지된다')
}

{
  const result = validateInterpretationCardText('이번 결과는 효과 판정에 해당합니다.')
  assertEqual(result.needsRetry, true, '의료적 판단 표현이 있으면 재시도가 필요하다')
  assertEqual(result.matches, [{ category: 'medical-judgment', expression: '효과 판정' }], '카테고리가 medical-judgment로 기록된다')
}

// --- 복합 케이스: 세 카테고리가 한 문장에 동시에 등장 ---------------------------

{
  const sentence = '피부 나이와 모공, 진단 결과를 함께 안내합니다.'
  const result = validateInterpretationCardText(sentence)

  assertEqual(result.hasForbiddenExpression, true, '복합 문장은 금지 표현이 감지된다')
  assertEqual(result.needsRetry, true, '복합 문장은 재시도가 필요하다')
  assertEqual(
    result.matches,
    [
      { category: 'absolute-evaluation', expression: '피부 나이' },
      { category: 'unmeasured-item', expression: '모공' },
      { category: 'medical-judgment', expression: '진단' },
    ],
    '세 카테고리 매치가 모두, 카테고리 순서대로 기록된다',
  )
}

// --- 경계 케이스: 빈 문자열 --------------------------------------------------

{
  const result = validateInterpretationCardText('')
  assertEqual(result.hasForbiddenExpression, false, '빈 문자열은 금지 표현이 없다')
  assertEqual(result.needsRetry, false, '빈 문자열은 재시도가 필요하지 않다')
}

console.log(`\n${passedCount}개 검증 통과`)
