(() => {
  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  // Display values directly on charts.
  Chart.register(ChartDataLabels);

  const DATA = (window.ENROLMENT_DATA || []).map(d => ({
    ...d,
    total: d.ftUndergrad + d.ftGraduate + d.ptUndergrad + d.ptGraduate
  }));

  const I18N = {
    en: {
      title: 'Canadian University Enrolment Dashboard',
      subtitle1: 'Explore and compare enrolment across Canadian universities.',
      subtitle2:
        'Use the filters and menus below to compare two universities or view detailed statistics for one university.',
      english: 'English',
      chinese: '中文',
      compare: 'COMPARE TWO UNIVERSITIES',
      universityA: 'University A',
      universityB: 'University B',
      province: 'Province',
      university: 'University',
      detailsFor: 'VIEW DETAILED STATISTICS FOR',
      additional: 'ADDITIONAL FILTERS',
      studentType: 'Student Type',
      view: 'View',
      allTypes: 'All Types',
      numberStudents: 'Number of Students',
      percentage: 'Percentage',
      totalUniversities: 'Total Universities',
      acrossCanada: 'across Canada',
      totalEnrolment: 'Total Enrolment',
      students: 'students',
      largestUniversity: 'Largest University',
      largestProvince: 'Largest Province',
      averageEnrolment: 'Average Enrolment per University',
      chart1: '1. Total Enrolment: University Comparison',
      chart1d:
        'Compare the selected enrolment measure between the two universities.',
      chart2: '2. Enrolment by Student Type: University Comparison',
      chart2d:
        'Compare the two universities across each student category using grouped bars.',
      chart3: '3. Student Type Distribution: Number and Percentage',
      chart3d:
        'Bars show the number of students and the line shows each category as a percentage of total enrolment.',
      barLegend: 'Number of Students',
      lineLegend: 'Percentage of Total Enrolment',
      chart4: '4. Top Universities by Total Enrolment (2025)',
      chart4d:
        'Top universities in Canada by the selected enrolment measure.',
      displayAs: 'Display as',
      showing: 'Showing data for:',
      showTop: 'Show Top',
      top5: 'Top 5',
      top10: 'Top 10',
      top15: 'Top 15',
      allCanada: 'All Canada',
      source:
        'Source: Universities Canada — Enrolment by university, academic year 2025/2026.',
      ftu: 'Full-time Undergraduate',
      ftg: 'Full-time Graduate',
      ptu: 'Part-time Undergraduate',
      ptg: 'Part-time Graduate'
    },

    zh: {
      title: '加拿大大学入学人数仪表盘',
      subtitle1: '探索并比较加拿大各大学的入学人数。',
      subtitle2:
        '使用下方筛选器和菜单比较两所大学，或查看一所大学的详细统计数据。',
      english: 'English',
      chinese: '中文',
      compare: '比较两所大学',
      universityA: '大学 A',
      universityB: '大学 B',
      province: '省份',
      university: '大学',
      detailsFor: '查看详细统计数据',
      additional: '其他筛选条件',
      studentType: '学生类型',
      view: '查看方式',
      allTypes: '所有类型',
      numberStudents: '学生人数',
      percentage: '百分比',
      totalUniversities: '大学总数',
      acrossCanada: '全加拿大',
      totalEnrolment: '入学总人数',
      students: '名学生',
      largestUniversity: '入学人数最多的大学',
      largestProvince: '入学人数最多的省份',
      averageEnrolment: '每所大学平均入学人数',
      chart1: '1. 入学人数：大学比较',
      chart1d: '比较所选两所大学的入学人数指标。',
      chart2: '2. 按学生类型比较大学入学人数',
      chart2d: '使用分组条形图比较两所大学各学生类别的入学情况。',
      chart3: '3. 学生类型分布：人数与百分比',
      chart3d: '柱状图显示学生人数，折线图显示各类别占总入学人数的百分比。',
      barLegend: '学生人数',
      lineLegend: '占总入学人数的百分比',
      chart4: '4. 入学人数最多的大学（2025）',
      chart4d: '根据所选入学指标显示加拿大排名最高的大学。',
      displayAs: '显示方式',
      showing: '当前显示：',
      showTop: '显示数量',
      top5: '前 5 名',
      top10: '前 10 名',
      top15: '前 15 名',
      allCanada: '全加拿大',
      source:
        '数据来源：加拿大大学协会——2025/2026 学年各大学入学人数。',
      ftu: '全日制本科生',
      ftg: '全日制研究生',
      ptu: '非全日制本科生',
      ptg: '非全日制研究生'
    }
  };

  const typeKeys = [
    'ftUndergrad',
    'ftGraduate',
    'ptUndergrad',
    'ptGraduate'
  ];

  const colors = [
    '#367bdc',
    '#54ad57',
    '#ff7d1a',
    '#8b48c7'
  ];

  const formatNumber = (number, lang) =>
    new Intl.NumberFormat(
      lang === 'zh' ? 'zh-CN' : 'en-CA'
    ).format(Math.round(number || 0));

  function useChart(ref, config, dependencies) {
    useEffect(() => {
      if (!ref.current) {
        return undefined;
      }

      const chart = new Chart(ref.current, config);

      return () => {
        chart.destroy();
      };
    }, dependencies);
  }

  function Select({
    id,
    label,
    value,
    onChange,
    options
  }) {
    return h(
      'div',
      null,

      h(
        'label',
        {
          htmlFor: id,
          className: 'form-label'
        },
        label
      ),

      h(
        'select',
        {
          id,
          className: 'form-select',
          value,
          onChange: event => onChange(event.target.value)
        },

        options.map(option =>
          h(
            'option',
            {
              key: option.value,
              value: option.value
            },
            option.label
          )
        )
      )
    );
  }

  function KPI({
    icon,
    color,
    label,
    value,
    note
  }) {
    return h(
      'article',
      {
        className: 'kpi-card'
      },

      h(
        'div',
        {
          className: 'kpi-icon',
          style: {
            background: color
          },
          'aria-hidden': 'true'
        },
        icon
      ),

      h(
        'div',
        {
          className: 'min-w-0'
        },

        h(
          'div',
          {
            className: 'kpi-label'
          },
          label
        ),

        h(
          'div',
          {
            className: 'kpi-value'
          },
          value
        ),

        h(
          'div',
          {
            className: 'kpi-note'
          },
          note
        )
      )
    );
  }

  function ChartCard({
    title,
    description,
    control,
    children
  }) {
    return h(
      'section',
      {
        className: 'chart-card'
      },

      h(
        'div',
        {
          className: 'chart-heading'
        },

        h(
          'div',
          null,

          h(
            'h2',
            {
              className: 'chart-title'
            },
            title
          ),

          h(
            'p',
            {
              className: 'chart-description'
            },
            description
          )
        ),

        control || null
      ),

      children
    );
  }

  function App() {
    const [lang, setLang] = useState('en');
    const t = I18N[lang];

    const typeLabels = [
      t.ftu,
      t.ftg,
      t.ptu,
      t.ptg
    ];

    const provinces = useMemo(
      () =>
        [...new Set(DATA.map(item => item.province))].sort(),
      []
    );

    const findDefault = name =>
      DATA.find(item =>
        item.university.includes(name)
      ) || DATA[0];

    const defaultA = findDefault('Ottawa');
    const defaultB = findDefault('British Columbia');

    const [provinceA, setProvinceA] = useState(
      defaultA.province
    );

    const [provinceB, setProvinceB] = useState(
      defaultB.province
    );

    const [uniA, setUniA] = useState(
      defaultA.university
    );

    const [uniB, setUniB] = useState(
      defaultB.university
    );

    const [detailChoice, setDetailChoice] = useState('A');
    const [studentType, setStudentType] = useState('all');
    const [viewMode, setViewMode] = useState('number');

    const [topN, setTopN] = useState('10');

    const listA = DATA.filter(
      item => item.province === provinceA
    );

    const listB = DATA.filter(
      item => item.province === provinceB
    );

    const a =
      DATA.find(item => item.university === uniA) ||
      listA[0];

    const b =
      DATA.find(item => item.university === uniB) ||
      listB[0];

    const detail =
      detailChoice === 'A' ? a : b;

    const setProvinceAndFirst = (
      universityGroup,
      province
    ) => {
      const first = DATA.find(
        item => item.province === province
      );

      if (universityGroup === 'A') {
        setProvinceA(province);

        if (first) {
          setUniA(first.university);
        }
      } else {
        setProvinceB(province);

        if (first) {
          setUniB(first.university);
        }
      }
    };

    const selectedValue = item =>
      studentType === 'all'
        ? item.total
        : item[studentType];

    const grandTotal = DATA.reduce(
      (sum, item) => sum + selectedValue(item),
      0
    );

    const largestUniversity = [...DATA].sort(
      (first, second) =>
        selectedValue(second) -
        selectedValue(first)
    )[0];

    const provinceTotals = DATA.reduce(
      (result, item) => {
        result[item.province] =
          (result[item.province] || 0) +
          selectedValue(item);

        return result;
      },
      {}
    );

    const largestProvince =
      Object.entries(provinceTotals).sort(
        (first, second) =>
          second[1] - first[1]
      )[0];

    const getPercent = (value, total) =>
      total
        ? Number(
            ((value / total) * 100).toFixed(1)
          )
        : 0;

    const selectedTypeLabel =
      studentType === 'all'
        ? t.allTypes
        : typeLabels[
            typeKeys.indexOf(studentType)
          ];

    const c1 = useRef(null);
    const c2 = useRef(null);
    const c3 = useRef(null);
    const c5 = useRef(null);

    /*
     * CHART 1
     * Total enrolment comparison
     */

    const valueA = selectedValue(a);
    const valueB = selectedValue(b);

    useChart(
      c1,
      {
        type: 'bar',

        data: {
          labels: [
            a.university,
            b.university
          ],

          datasets: [
            {
              data: [
                valueA,
                valueB
              ],

              backgroundColor: [
                '#367bdc',
                '#54ad57'
              ],

              borderRadius: 3,
              maxBarThickness: 125
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          /*
           * This top padding prevents the values
           * above the bars from being cut off.
           */
          layout: {
            padding: {
              top: 28,
              left: 5,
              right: 5
            }
          },

          plugins: {
            legend: {
              display: false
            },

            tooltip: {
              callbacks: {
                label: context =>
                  `${selectedTypeLabel}: ${formatNumber(
                    context.raw,
                    lang
                  )}`
              }
            },

            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 5,
              clamp: true,
              clip: false,

              color: '#102a56',

              font: {
                weight: '700',
                size: 12
              },

              formatter: value =>
                formatNumber(value, lang)
            }
          },

          scales: {
            y: {
              beginAtZero: true,

              /*
               * Adds extra space above the
               * tallest bar.
               */
              grace: '18%',

              title: {
                display: true,
                text: t.numberStudents
              },

              ticks: {
                callback: value =>
                  formatNumber(value, lang)
              }
            },

            x: {
              grid: {
                display: false
              }
            }
          }
        }
      },

      [
        a.university,
        b.university,
        studentType,
        lang
      ]
    );

    /*
     * CHART 2
     * Grouped horizontal bar comparison
     * Each student category has two bars, one for each university.
     */

    const rawA = typeKeys.map(
      key => a[key]
    );

    const rawB = typeKeys.map(
      key => b[key]
    );

    const chart2A =
      viewMode === 'percentage'
        ? rawA.map(value =>
            getPercent(value, a.total)
          )
        : rawA;

    const chart2B =
      viewMode === 'percentage'
        ? rawB.map(value =>
            getPercent(value, b.total)
          )
        : rawB;

    useChart(
      c2,
      {
        type: 'bar',

        data: {
          labels: typeLabels,

          datasets: [
            {
              label: a.university,
              data: chart2A,
              backgroundColor: '#367bdc',
              borderRadius: 3,
              barPercentage: 0.78,
              categoryPercentage: 0.72
            },
            {
              label: b.university,
              data: chart2B,
              backgroundColor: '#54ad57',
              borderRadius: 3,
              barPercentage: 0.78,
              categoryPercentage: 0.72
            }
          ]
        },

        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,

          layout: {
            padding: {
              right: 54
            }
          },

          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 12,
                padding: 18,
                color: '#10284d',
                font: {
                  weight: '700',
                  size: 11
                }
              }
            },

            tooltip: {
              callbacks: {
                label: context => {
                  const university =
                    context.datasetIndex === 0 ? a : b;
                  const rawValue =
                    typeKeys.map(key => university[key])[context.dataIndex];
                  const percentage =
                    getPercent(rawValue, university.total);

                  return viewMode === 'percentage'
                    ? `${context.dataset.label}: ${context.raw}% (${formatNumber(
                        rawValue,
                        lang
                      )} ${t.students})`
                    : `${context.dataset.label}: ${formatNumber(
                        context.raw,
                        lang
                      )} (${percentage}%)`;
                }
              }
            },

            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 4,
              clamp: true,
              clip: false,
              color: '#102a56',

              font: {
                weight: '700',
                size: 10
              },

              formatter: value => {
                if (!value) {
                  return '';
                }

                return viewMode === 'percentage'
                  ? `${value}%`
                  : formatNumber(value, lang);
              }
            }
          },

          scales: {
            x: {
              beginAtZero: true,
              grace: '14%',

              max:
                viewMode === 'percentage'
                  ? 100
                  : undefined,

              title: {
                display: true,
                text:
                  viewMode === 'percentage'
                    ? t.percentage
                    : t.numberStudents
              },

              ticks: {
                callback: value =>
                  viewMode === 'percentage'
                    ? `${value}%`
                    : formatNumber(value, lang)
              }
            },

            y: {
              grid: {
                display: false
              },

              ticks: {
                autoSkip: false,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      },

      [
        a.university,
        b.university,
        viewMode,
        lang
      ]
    );

    /*
     * CHART 3
     * Combined bar and line chart
     * Bars show student numbers; line shows percentages.
     */

    const detailValues = typeKeys.map(
      key => detail[key]
    );

    const detailPercentages =
      detailValues.map(value =>
        getPercent(value, detail.total)
      );

    useChart(
      c3,
      {
        type: 'bar',

        data: {
          labels: typeLabels,

          datasets: [
            {
              type: 'bar',
              label: t.barLegend,
              data: detailValues,
              backgroundColor: colors,
              borderRadius: 3,
              yAxisID: 'yStudents',
              order: 2,

              datalabels: {
                /*
                 * Keep the number label inside the bar. This separates it
                 * from the percentage label placed above the line point.
                 */
                anchor: 'center',
                align: 'center',
                offset: 0,
                clamp: true,
                clip: false,
                color: '#ffffff',
                textStrokeColor: 'rgba(0, 0, 0, 0.28)',
                textStrokeWidth: 2,
                font: {
                  weight: '800',
                  size: 11
                },
                display: false,
                formatter: value =>
                  value ? formatNumber(value, lang) : ''
              }
            },
            {
              type: 'line',
              label: t.lineLegend,
              data: detailPercentages,
              /*
               * Dark navy matches the dashboard title and language selector,
               * while remaining clearly different from the brighter bar colours.
               */
              borderColor: '#0d2548',
              backgroundColor: '#0d2548',
              pointBackgroundColor: '#0d2548',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 6,
              borderWidth: 3,
              tension: 0.25,
              fill: false,
              yAxisID: 'yPercentage',
              order: 1,

              datalabels: {
                /* Percentage labels sit above the navy line in a solid pill. */
                anchor: 'end',
                align: 'top',
                offset: 12,
                clamp: true,
                clip: false,
                color: '#ffffff',
                backgroundColor: '#0d2548',
                borderColor: '#ffffff',
                borderWidth: 1,
                borderRadius: 5,
                padding: {
                  top: 3,
                  right: 5,
                  bottom: 3,
                  left: 5
                },
                font: {
                  weight: '800',
                  size: 10
                },
                display: false,
                formatter: value => `${value}%`
              }
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          layout: {
            padding: {
              top: 46,
              right: 12,
              left: 4
            }
          },

          interaction: {
            mode: 'index',
            intersect: false
          },

          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 14,
                padding: 20,
                color: '#10284d',
                font: {
                  weight: '700',
                  size: 11
                }
              }
            },

            tooltip: {
              callbacks: {
                label: context => {
                  if (context.dataset.yAxisID === 'yPercentage') {
                    return `${context.dataset.label}: ${context.raw}%`;
                  }

                  return `${context.dataset.label}: ${formatNumber(
                    context.raw,
                    lang
                  )}`;
                }
              }
            }
          },

          scales: {
            yStudents: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              grace: '18%',

              title: {
                display: true,
                text: t.numberStudents
              },

              ticks: {
                callback: value =>
                  formatNumber(value, lang)
              }
            },

            yPercentage: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              min: 0,
              max: 100,

              title: {
                display: true,
                text: t.percentage
              },

              ticks: {
                callback: value => `${value}%`
              },

              grid: {
                drawOnChartArea: false
              }
            },

            x: {
              grid: {
                display: false
              },

              ticks: {
                maxRotation: 0,
                minRotation: 0
              }
            }
          }
        }
      },

      [
        detail.university,
        lang
      ]
    );

    /*
     * CHART 5
     * Top universities horizontal chart
     */

    const ranked = [...DATA]
      .sort(
        (first, second) =>
          selectedValue(second) -
          selectedValue(first)
      )
      .slice(0, Number(topN));

    useChart(
      c5,
      {
        type: 'bar',

        data: {
          labels: ranked.map(
            item => item.university
          ),

          datasets: [
            {
              data: ranked.map(
                selectedValue
              ),

              backgroundColor: '#367bdc',
              borderRadius: 2
            }
          ]
        },

        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,

          /*
           * Extra right padding gives the
           * number labels enough room.
           */
          layout: {
            padding: {
              right: 90
            }
          },

          plugins: {
            legend: {
              display: false
            },

            tooltip: {
              callbacks: {
                label: context =>
                  `${selectedTypeLabel}: ${formatNumber(
                    context.raw,
                    lang
                  )}`
              }
            },

            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 6,
              clamp: true,
              clip: false,

              color: '#102a56',

              font: {
                weight: '700',
                size: 12
              },

              formatter: value =>
                formatNumber(value, lang)
            }
          },

          scales: {
            x: {
              beginAtZero: true,

              /*
               * Adds extra space after the
               * longest horizontal bar.
               */
              grace: '25%',

              title: {
                display: true,
                text: t.numberStudents
              },

              ticks: {
                callback: value =>
                  formatNumber(value, lang)
              }
            },

            y: {
              grid: {
                display: false
              },

              ticks: {
                autoSkip: false,

                font: {
                  size: 10
                }
              }
            }
          }
        }
      },

      [
        topN,
        studentType,
        lang
      ]
    );

    const provinceOptions =
      provinces.map(province => ({
        value: province,
        label: province
      }));

    const uniOptionsA =
      listA.map(item => ({
        value: item.university,
        label: item.university
      }));

    const uniOptionsB =
      listB.map(item => ({
        value: item.university,
        label: item.university
      }));

    const typeOptions = [
      {
        value: 'all',
        label: t.allTypes
      },

      ...typeKeys.map(
        (key, index) => ({
          value: key,
          label: typeLabels[index]
        })
      )
    ];

    return h(
      'main',
      {
        className: 'dashboard-shell'
      },

      /*
       * HEADER
       */

      h(
        'header',
        {
          className: 'dashboard-header'
        },

        h(
          'div',
          null,

          h(
            'h1',
            {
              className: 'dashboard-title'
            },
            t.title
          ),

          h(
            'p',
            {
              className: 'dashboard-subtitle'
            },
            t.subtitle1
          ),

          h(
            'p',
            {
              className:
                'dashboard-subtitle second'
            },
            t.subtitle2
          )
        ),

        h(
          'div',
          {
            className: 'header-actions'
          },

          h(
            'div',
            {
              className: 'language-switch',
              role: 'group',
              'aria-label':
                'Language selection'
            },

            h(
              'button',
              {
                className:
                  lang === 'en'
                    ? 'active'
                    : '',

                onClick: () =>
                  setLang('en'),

                'aria-pressed':
                  lang === 'en'
              },
              t.english
            ),

            h(
              'button',
              {
                className:
                  lang === 'zh'
                    ? 'active'
                    : '',

                onClick: () =>
                  setLang('zh'),

                'aria-pressed':
                  lang === 'zh'
              },
              t.chinese
            )
          ),

          h(
            'div',
            {
              className: 'data-note'
            },

            h(
              'span',
              {
                className: 'info-dot'
              },
              'i'
            ),

            t.source
          )
        )
      ),

      /*
       * FILTER PANEL
       */

      h(
        'section',
        {
          className:
            'filters-panel mb-3'
        },

        h(
          'div',
          {
            className: 'filters-grid'
          },

          /*
           * University A
           */

          h(
            'div',
            {
              className:
                'filter-block compare-a'
            },

            h(
              'div',
              {
                className:
                  'section-label'
              },
              t.compare
            ),

            h(
              'div',
              {
                className: 'filter-title'
              },
              t.universityA
            ),

            h(
              'div',
              {
                className: 'row g-2'
              },

              h(
                'div',
                {
                  className: 'col-5'
                },

                h(Select, {
                  id: 'provinceA',
                  label: t.province,
                  value: provinceA,

                  onChange: value =>
                    setProvinceAndFirst(
                      'A',
                      value
                    ),

                  options: provinceOptions
                })
              ),

              h(
                'div',
                {
                  className: 'col-7'
                },

                h(Select, {
                  id: 'uniA',
                  label: t.university,
                  value: a.university,
                  onChange: setUniA,
                  options: uniOptionsA
                })
              )
            )
          ),

          /*
           * University B
           */

          h(
            'div',
            {
              className:
                'filter-block compare-b'
            },

            h(
              'div',
              {
                className:
                  'section-label invisible-label'
              },
              t.compare
            ),

            h(
              'div',
              {
                className: 'filter-title'
              },
              t.universityB
            ),

            h(
              'div',
              {
                className: 'row g-2'
              },

              h(
                'div',
                {
                  className: 'col-5'
                },

                h(Select, {
                  id: 'provinceB',
                  label: t.province,
                  value: provinceB,

                  onChange: value =>
                    setProvinceAndFirst(
                      'B',
                      value
                    ),

                  options: provinceOptions
                })
              ),

              h(
                'div',
                {
                  className: 'col-7'
                },

                h(Select, {
                  id: 'uniB',
                  label: t.university,
                  value: b.university,
                  onChange: setUniB,
                  options: uniOptionsB
                })
              )
            )
          ),

          /*
           * Detail university choice
           */

          h(
            'div',
            {
              className:
                'filter-block detail-filter'
            },

            h(
              'div',
              {
                className: 'section-label'
              },
              t.detailsFor
            ),

            h(
              'div',
              {
                className:
                  'form-check mb-2'
              },

              h('input', {
                id: 'detailA',
                className:
                  'form-check-input',
                type: 'radio',
                name: 'details',
                checked:
                  detailChoice === 'A',

                onChange: () =>
                  setDetailChoice('A')
              }),

              h(
                'label',
                {
                  htmlFor: 'detailA',
                  className:
                    'form-check-label'
                },
                t.universityA
              )
            ),

            h(
              'div',
              {
                className: 'form-check'
              },

              h('input', {
                id: 'detailB',
                className:
                  'form-check-input',
                type: 'radio',
                name: 'details',
                checked:
                  detailChoice === 'B',

                onChange: () =>
                  setDetailChoice('B')
              }),

              h(
                'label',
                {
                  htmlFor: 'detailB',
                  className:
                    'form-check-label'
                },
                t.universityB
              )
            )
          ),

          /*
           * Additional filters
           */

          h(
            'div',
            {
              className:
                'filter-block additional-filter'
            },

            h(
              'div',
              {
                className: 'section-label'
              },
              t.additional
            ),

            h(
              'div',
              {
                className: 'row g-2'
              },

              h(
                'div',
                {
                  className: 'col-6'
                },

                h(Select, {
                  id: 'studentType',
                  label: t.studentType,
                  value: studentType,
                  onChange:
                    setStudentType,
                  options: typeOptions
                })
              ),

              h(
                'div',
                {
                  className: 'col-6'
                },

                h(Select, {
                  id: 'viewMode',
                  label: t.view,
                  value: viewMode,
                  onChange: setViewMode,

                  options: [
                    {
                      value: 'number',
                      label:
                        t.numberStudents
                    },

                    {
                      value:
                        'percentage',
                      label:
                        t.percentage
                    }
                  ]
                })
              )
            )
          )
        )
      ),

      /*
       * KPI CARDS
       */

      h(
        'section',
        {
          className: 'row g-3 mb-3',
          'aria-label':
            'Summary statistics'
        },

        h(
          'div',
          {
            className:
              'col-12 col-sm-6 col-xl'
          },

          h(KPI, {
            icon: '▥',
            color: '#5f73ef',
            label: t.totalUniversities,
            value: formatNumber(
              DATA.length,
              lang
            ),
            note: t.acrossCanada
          })
        ),

        h(
          'div',
          {
            className:
              'col-12 col-sm-6 col-xl'
          },

          h(KPI, {
            icon: '●●',
            color: '#4aab57',
            label: t.totalEnrolment,
            value: formatNumber(
              grandTotal,
              lang
            ),
            note: t.students
          })
        ),

        h(
          'div',
          {
            className:
              'col-12 col-sm-6 col-xl'
          },

          h(KPI, {
            icon: '◆',
            color: '#ff7a18',
            label: t.largestUniversity,
            value:
              largestUniversity.university,

            note: `${formatNumber(
              selectedValue(
                largestUniversity
              ),
              lang
            )} ${t.students}`
          })
        ),

        h(
          'div',
          {
            className:
              'col-12 col-sm-6 col-xl'
          },

          h(KPI, {
            icon: '●',
            color: '#8a46c4',
            label: t.largestProvince,
            value: largestProvince[0],

            note: `${formatNumber(
              largestProvince[1],
              lang
            )} ${t.students}`
          })
        ),

        h(
          'div',
          {
            className:
              'col-12 col-sm-6 col-xl'
          },

          h(KPI, {
            icon: '▥',
            color: '#18a7a9',
            label: t.averageEnrolment,

            value: formatNumber(
              grandTotal / DATA.length,
              lang
            ),

            note: t.students
          })
        )
      ),

      /*
       * FIRST CHART ROW
       */

      h(
        'div',
        {
          className: 'row g-3 mb-3'
        },

        h(
          'div',
          {
            className:
              'col-12 col-xl-5'
          },

          h(
            ChartCard,
            {
              title: t.chart1,
              description: t.chart1d
            },

            h(
              'div',
              {
                className: 'chart-wrap'
              },

              h('canvas', {
                ref: c1,
                role: 'img',
                'aria-label': t.chart1
              })
            )
          )
        ),

        h(
          'div',
          {
            className:
              'col-12 col-xl-7'
          },

          h(
            ChartCard,
            {
              title: t.chart2,
              description: t.chart2d
            },

            h(
              'div',
              {
                className: 'chart-wrap'
              },

              h('canvas', {
                ref: c2,
                role: 'img',
                'aria-label': t.chart2
              })
            )
          )
        )
      ),

      /*
       * SECOND CHART ROW
       */

      h(
        'div',
        {
          className: 'row g-3 mb-3'
        },

        /*
         * Combined Chart 3
         */

        h(
          'div',
          {
            className:
              'col-12 col-xl-8'
          },

          h(
            ChartCard,
            {
              title: t.chart3,
              description: t.chart3d
            },

            h(
              'div',
              {
                className:
                  'chart-wrap detail-chart combined-detail-chart'
              },

              h('canvas', {
                ref: c3,
                role: 'img',
                'aria-label': t.chart3
              })
            ),

            h(
              'div',
              {
                className: 'chart-status'
              },

              h(
                'span',
                {
                  className:
                    'info-dot small'
                },
                'i'
              ),

              `${t.showing} ${detail.university}`
            )
          )
        ),

        /*
         * Chart 4: top universities
         */

        h(
          'div',
          {
            className:
              'col-12 col-xl-4'
          },

          h(
            ChartCard,
            {
              title: t.chart4,
              description: t.chart4d,

              control: h(
                'div',
                {
                  className:
                    'small-control'
                },

                h(Select, {
                  id: 'topN',
                  label: t.showTop,
                  value: topN,
                  onChange: setTopN,

                  options: [
                    {
                      value: '5',
                      label: t.top5
                    },

                    {
                      value: '10',
                      label: t.top10
                    },

                    {
                      value: '15',
                      label: t.top15
                    }
                  ]
                })
              )
            },

            h(
              'div',
              {
                className:
                  'chart-wrap detail-chart'
              },

              h('canvas', {
                ref: c5,
                role: 'img',
                'aria-label': t.chart4
              })
            )
          )
        )
      ),

      /*
       * FOOTER
       */

      h(
        'footer',
        {
          className: 'source-note'
        },

        h(
          'span',
          {
            className: 'info-dot small'
          },
          'i'
        ),

        t.source
      )
    );
  }

  ReactDOM
    .createRoot(
      document.getElementById('root')
    )
    .render(h(App));
})();